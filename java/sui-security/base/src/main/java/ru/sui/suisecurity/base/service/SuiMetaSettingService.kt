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

    fun getInt(settingKey: String): Int? = Integer.valueOf(suiMetaSettingRepository.get(settingKey)) ?: null

    fun getLong(settingKey: String): Long? = let{ suiMetaSettingRepository.get(settingKey) ?: null }?.toLong()

    fun getDuration(settingKey: String): Date? = getLong(suiMetaSettingRepository.get(settingKey))?.let { LocalDateTime.now().minusDays(it).toDate() }
}