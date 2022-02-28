val javaVersion = JavaVersion.VERSION_1_8

plugins {
  id("java")
  id("maven-publish")

  val kotlinVersion = "1.6.10"
  kotlin("jvm") version kotlinVersion
  kotlin("plugin.spring") version kotlinVersion
  kotlin("plugin.jpa") version kotlinVersion

  id("io.spring.dependency-management") version "1.0.11.RELEASE"

  id("org.springframework.boot") version "2.6.3" apply false
  id("com.google.cloud.tools.jib") version "3.1.4" apply false
}

apply(plugin = "idea")

allprojects {
  group = "ru.sui"
  version = "${System.getenv("BUILD_NUMBER") ?: "1.0"}${System.getenv("SUFFIX") ?: "-SNAPSHOT"}"

  apply(plugin = "java")
  apply(plugin = "kotlin")

  apply(plugin = "io.spring.dependency-management")

  apply(plugin = "org.jetbrains.kotlin.plugin.spring")
  apply(plugin = "org.jetbrains.kotlin.plugin.jpa")

  java.sourceCompatibility = javaVersion

  repositories {
    mavenCentral()
    maven("https://repository.cloudera.com/artifactory/cloudera-repos/")
    maven("https://nexus.suilib.ru/repository/mvn-sui/")
  }
}

subprojects {
  apply(plugin = "maven-publish")

  configurations(closureOf<ConfigurationContainer> {
    compileOnly {
      extendsFrom(configurations.annotationProcessor.get())
    }
  })

  dependencyManagement {
    // https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/2.6.3/spring-boot-dependencies-2.6.3.pom
    imports {
      mavenBom("org.springframework.boot:spring-boot-dependencies:2.6.3")
    }

    dependencies {
      dependency("com.vladmihalcea:hibernate-types-52:2.3.2")
      dependency("org.redisson:redisson-spring-boot-starter:3.16.8")
      dependency("org.apache.hbase:hbase-client:2.1.0-cdh6.3.1")
      dependency("org.apache.hadoop:hadoop-client:3.0.0-cdh6.3.1")
      dependency("org.apache.hadoop:hadoop-hdfs:3.0.0-cdh6.3.1")
      dependency("org.apache.hadoop:hadoop-hdfs-client:3.0.0-cdh6.3.1")
      dependency("org.apache.parquet:parquet-hadoop:1.10.1")
      dependency("io.github.microutils:kotlin-logging:1.7.4")
    }
  }

  dependencies {
    api(kotlin("stdlib-jdk8"))
    api(kotlin("reflect"))

    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
  }

  java {
//    withJavadocJar()
    withSourcesJar()
  }

  tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
      freeCompilerArgs = listOf("-Xjsr305=strict")
      jvmTarget = javaVersion.toString()
    }
  }

  tasks.withType<Test> {
    useJUnitPlatform()
  }

  publishing {
    publications {
      create<MavenPublication>("nexus") {
        from(components["java"])
      }
    }

    repositories {
      maven {
        name = "nexus"
        url = uri("https://nexus.suilib.ru/repository/mvn-sui/")
      }
    }
  }
}
