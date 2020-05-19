package ru.smsoft.sui.suisecurity.utils

const val USER_ID_SETTING_NAME = "user.id"

// Caches

internal const val VALIDATE_TOKEN_CACHE = "__sui_validate_token_cache"
internal const val LOAD_USER_BY_USERNAME_CACHE = "__sui_load_user_by_username_cache"
internal const val LOAD_USER_BY_ID_CACHE = "__sui_load_user_by_id_cache"
internal const val TABLE_INFO_BY_CAMEL_CASE_NAME_CACHE = "__sui_table_info_by_camel_case_name_cache"

// Authentication result code

const val SUCCESS_LOGIN_AUTH_RESULT_CODE = "success login"
const val WRONG_PASSWORD_AUTH_RESULT_CODE = "wrong password"
const val FAILURE_TOO_MANY_ATTEMPTS_AUTH_RESULT_CODE = "failure (too many attempts)"
// const val FAILURE_NO_RIGHTS_AUTH_RESULT_CODE = "failure (no rights)"
const val FAILURE_DELETED_AUTH_RESULT_CODE = "failure (deleted)"
const val ERROR_RESULT_CODE = "error"
const val SUCCESS_LOGOUT_COMMAND_RESULT_CODE = "success logout (command)"
const val SUCCESS_LOGOUT_TIMEOUT_RESULT_CODE = "success logout (timeout)"
