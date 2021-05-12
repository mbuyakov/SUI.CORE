package ru.sui.suisecurity.base.utils

import mu.KotlinLogging
import java.util.*

private val log = KotlinLogging.logger { }

val sudirTmpToken by lazy {
  val token = "sudir-${UUID.randomUUID()}"
  log.info { "SUDIR tmp token: $token" }
  token
}
