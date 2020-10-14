package ru.sui.suimetaschemaservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.DependsOn;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@SuppressWarnings({"SqlNoDataSourceInspection", "SqlResolve"})
@Service
@Slf4j
@DependsOn("queryConfig")
public class MetaSchemaExporter {

    private final JdbcTemplate jdbcTemplate;
    private final String dumpFunctionQuery;
    private final String metaFunctionQuery;

    public MetaSchemaExporter(
            JdbcTemplate jdbcTemplate,
            @Value("${sql.query.__dump}") String dumpFunctionQuery,
            @Value("${sql.query.__meta}") String metaFunctionQuery
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.dumpFunctionQuery = dumpFunctionQuery;
        this.metaFunctionQuery = metaFunctionQuery;
    }

    @Transactional
    public String export() {
        // create or replace __dump function
        jdbcTemplate.execute(dumpFunctionQuery);
        // create or replace __meta function
        jdbcTemplate.execute(metaFunctionQuery);

        return jdbcTemplate.queryForObject("SELECT __meta()", String.class);
    }

}
