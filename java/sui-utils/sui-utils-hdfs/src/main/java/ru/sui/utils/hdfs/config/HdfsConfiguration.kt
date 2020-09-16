package ru.sui.utils.hdfs.config

import org.apache.hadoop.fs.FileSystem
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import ru.sui.utils.hdfs.service.HdfsService


@Configuration
class HdfsConfiguration {

  @Bean
  fun fs(
      @Value("\${hdfs.url:#{null}}") hdfsUrl: String?,
      @Value("\${hdfs.user:#{null}}") hdfsUser: String?,
      hdfsService: HdfsService
  ): FileSystem {
      return hdfsService.getInstance(
          System.getenv("HDFS_URL") ?: hdfsUrl!!,
          System.getenv("HDFS_USER") ?: hdfsUser
      )
  }

}
