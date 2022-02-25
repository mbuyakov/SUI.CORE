include(":sui-audit:common")
include(":sui-audit:log-mover")
include(":sui-audit:manager")
include(":sui-backend")
include(":sui-entity")
include(":sui-meta-schema-service")
include(":sui-migration")
include(":sui-security:base")
include(":sui-security:server")
include(":sui-user-transaction")
include(":sui-utils:sui-utils-hbase")
include(":sui-utils:sui-utils-hdfs")
include(":sui-utils:sui-utils-kotlin")
include(":sui-utils:sui-utils-parquet")

rootProject.name = "sui"

project(":sui-audit:common").name = "sui-audit-common"
project(":sui-audit:log-mover").name = "sui-audit-log-mover"
project(":sui-audit:manager").name = "sui-audit-manager"
project(":sui-security:base").name = "sui-security-base"
project(":sui-security:server").name = "sui-security-server"
