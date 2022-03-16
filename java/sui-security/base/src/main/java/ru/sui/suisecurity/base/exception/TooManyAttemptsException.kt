package ru.sui.suisecurity.base.exception

class TooManyAttemptsException : RuntimeException("Превышен лимит попыток аутентификации")