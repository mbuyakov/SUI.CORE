package ru.smsoft.sui.suisecurity.lock

import java.util.concurrent.locks.Lock


interface LockProvider {

    fun get(group: String, key: String): Lock

}