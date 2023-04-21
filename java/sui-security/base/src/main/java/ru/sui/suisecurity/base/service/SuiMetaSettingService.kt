package ru.sui.suisecurity.base.service

import lombok.RequiredArgsConstructor
import org.springframework.stereotype.Service
import ru.sui.suientity.repository.suimeta.SuiMetaSettingRepository
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Service
@RequiredArgsConstructor
class SuiMetaSettingService(
    val suiMetaSettingRepository: SuiMetaSettingRepository
) {
    fun LocalDateTime.toDate(): Date = Date.from(this.toInstant(ZoneOffset.UTC))

    fun getInt(settingKey: String): Int? = suiMetaSettingRepository.get(settingKey).toIntOrNull()

    fun getLong(settingKey: String): Long? = suiMetaSettingRepository.get(settingKey).toLongOrNull()

    fun getDuration(settingKey: String): Date? = getLong(settingKey)?.let { LocalDateTime.now().minusDays(it).toDate() }
}