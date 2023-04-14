package ru.sui.suibackend.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import ru.sui.suientity.repository.suimeta.SuiMetaSettingRepository;
import java.time.*;

@Service
@RequiredArgsConstructor
public class SuiMetaSettingService {
    private final SuiMetaSettingRepository suiMetaSettingRepository;
    private final SessionService sessionService;

    public Integer getInt(String settingKey) {
        return Integer.valueOf(suiMetaSettingRepository.get(settingKey));
    }

    public Long getLong(String settingKey) {
        return Long.parseLong(suiMetaSettingRepository.get(settingKey));
    }
    public Date getDuration(String settingKey) {
        return Date.valueOf(LocalDate.now().minusDays(getLong(suiMetaSettingRepository.get(settingKey))))
    }
}