package ru.sui.suibackend.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import ru.sui.suientity.repository.suimeta.SuiMetaSettingRepository;

import java.time.*;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class SuiMetaSettingService {
    public Date toDate(LocalDateTime date) {
        return Date.from(date.toInstant(ZoneOffset.UTC));
    }
    private final SuiMetaSettingRepository suiMetaSettingRepository;

    public Integer getInt(String settingKey) {
        return Integer.valueOf(suiMetaSettingRepository.get(settingKey));
    }

    public Long getLong(String settingKey) {
        return Long.parseLong(suiMetaSettingRepository.get(settingKey));
    }
    public Date getDuration(String settingKey) {
        return toDate(LocalDateTime.now().minusDays(getLong(suiMetaSettingRepository.get(settingKey))));
    }
}