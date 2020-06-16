package ru.sui.suisecurity.utils

import org.apache.commons.text.CaseUtils

import java.util.function.Function
import java.util.regex.Matcher
import java.util.regex.Pattern

class TextUtils {
    companion object {
        private val camelCaseFixPatter = Pattern.compile("([0-9][a-z])")

        @JvmStatic
        fun toCamelCase(string: String): String {
            val result = StringBuilder(CaseUtils.toCamelCase(string, false, '_'))
            val matcher = camelCaseFixPatter.matcher(result.toString())

            while (matcher.find()) {
                result.replace(matcher.start(), matcher.end(), matcher.group().toUpperCase())
            }

            return result.toString()
        }

        @JvmStatic
        fun replace(input: String, regex: Pattern, replacer: Function<Matcher, String>): String {
            val resultString = StringBuffer()
            val regexMatcher = regex.matcher(input)

            while (regexMatcher.find()) {
                regexMatcher.appendReplacement(resultString, replacer.apply(regexMatcher))
            }
            regexMatcher.appendTail(resultString)

            return resultString.toString()
        }

        @JvmStatic
        fun removePluralEnding(str: String?): String? {
            if (str != null && str.isNotEmpty()) {
                if (str.endsWith("uses")) {
                    return str.substring(0, str.length - 2)
                }
                if (str.endsWith("ies")) {
                    return str.substring(0, str.length - 3) + "y"
                }
                if (str.endsWith("s")) {
                    return str.substring(0, str.length - 1)
                }
            }

            return str
        }
    }
}
