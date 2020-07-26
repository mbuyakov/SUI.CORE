package ru.sui.audit.common.extension

import java.time.Duration
import java.util.*


fun Date.nanos() = Duration.ofMillis(this.time).toNanos()