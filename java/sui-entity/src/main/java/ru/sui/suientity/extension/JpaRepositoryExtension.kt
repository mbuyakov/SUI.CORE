package ru.sui.suientity.extension

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.support.JpaEntityInformationSupport
import ru.sui.utils.kotlin.extension.getOrNotFound
import java.lang.reflect.ParameterizedType

fun <T, ID> JpaRepository<T, ID>.findByIdOrThrowNotFound(id: ID): T {
  return this.findById(id).getOrNotFound(this.tableName(), "id" to id)
}

@Suppress("UNCHECKED_CAST")
// Work only with java entity classes
fun <T, ID> JpaRepository<T, ID>.tableName(): String {
  val proxiedInterfaces = this::class.java.getMethod("getProxiedInterfaces").invoke(this) as Array<Class<*>>
  val entityClass = (proxiedInterfaces[0].genericInterfaces[0] as ParameterizedType).actualTypeArguments[0] as Class<T>
  val entityManager = EntityManagerHolder.INSTANCE

  return entityManager
    ?.let { JpaEntityInformationSupport.getEntityInformation(entityClass, it).entityName }
    ?: entityClass.simpleName
}
