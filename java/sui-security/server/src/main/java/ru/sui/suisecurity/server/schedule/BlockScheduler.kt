package ru.sui.suisecurity.server.schedule

import mu.KotlinLogging
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import ru.sui.suientity.repository.suisecurity.UserRepository
import ru.sui.suisecurity.base.service.SuiMetaSettingService
import ru.sui.suisecurity.base.session.SessionService
import javax.transaction.Transactional

private val log = KotlinLogging.logger { }

@Configuration
@EnableScheduling
class BlockScheduler(
    private val sessionService: SessionService,
    private val suiMetaSettingService: SuiMetaSettingService,
    private val userRepository: UserRepository
) {
    companion object {
        const val BLOCKED_CRON = "0 0 1 * * *"
        const val TOO_MANY_INACTIVITY_DAYS = "too_many_inactivity_days"
    }

    @Transactional
    @Scheduled(cron = BLOCKED_CRON)
    fun blockInactivityUsers() {
        if (suiMetaSettingService.getDuration("allowable_user_inactivity_days") != null) {
            log.info { "Start blocking users with ${suiMetaSettingService.getDuration("allowable_user_inactivity_days")} inactivity days" }
            userRepository.findAll()
                .filter {
                    !it.blocked && sessionService.findLastActivity(it.id) != null
                            && suiMetaSettingService.getDuration("allowable_user_inactivity_days")
                                ?.after(sessionService.findLastActivity(it.id)?.lastUserActivity) == true
                }
                .forEach {
                    it.blocked = true
                    it.blockReason = TOO_MANY_INACTIVITY_DAYS
                    userRepository.save(it)
                }
            log.info { "Users success blocked" }
        }
    }
}