package ru.mos.sms.rest.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.smsoft.sui.suimetaschemaservice.service.MetaSchemaRefresher

@RestController
@RequestMapping("/api")
class MainController {
    @Autowired
    private lateinit var metaSchemaRefresher: MetaSchemaRefresher

    @GetMapping("/refreshMetaschema")
    @PreAuthorize("hasRole('ADMIN')")
    fun refreshMetaschema() {
        metaSchemaRefresher.refreshSchema()
    }
}
