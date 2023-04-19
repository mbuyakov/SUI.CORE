package ru.sui.suisecurity.base.exception

class BlockAttemptsException : RuntimeException("Превышен лимит неуспешных попыток аутентификации")