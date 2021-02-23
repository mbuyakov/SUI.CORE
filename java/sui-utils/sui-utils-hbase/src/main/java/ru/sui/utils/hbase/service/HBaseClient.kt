package ru.sui.utils.hbase.service

import org.apache.hadoop.conf.Configuration
import org.apache.hadoop.hbase.HBaseConfiguration
import org.apache.hadoop.hbase.TableName
import org.apache.hadoop.hbase.client.*
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.net.InetAddress
import java.util.concurrent.ExecutorService


@Service
class HBaseClient(
  @Value("\${zookeeper.host}") private val zookeeperHost: String,
  @Value("\${zookeeper.znode.parent:#{null}}") private val zookeeperZnodeParent: String?
): Connection {

    private val conf: Configuration = HBaseConfiguration.create()
    private val connection: Connection

    init {
        conf["hbase.zookeeper.quorum"] = zookeeperHost.split(',').flatMap { InetAddress.getAllByName(it.trim()).toList() }.map { it.hostAddress }.distinct().joinToString(",")
        if(zookeeperZnodeParent != null) {
          conf["zookeeper.znode.parent"] = zookeeperZnodeParent
        }
        conf["hbase.zookeeper.property.clientPort"] = "2181"
        conf["hbase.client.keyvalue.maxsize"] = "0"
        connection = ConnectionFactory.createConnection(conf)
    }

    override fun isAborted(): Boolean = connection.isAborted

    override fun getRegionLocator(tableName: TableName): RegionLocator = connection.getRegionLocator(tableName)

    override fun getBufferedMutator(tableName: TableName): BufferedMutator = connection.getBufferedMutator(tableName)

    override fun getBufferedMutator(params: BufferedMutatorParams?): BufferedMutator = connection.getBufferedMutator(params)

    override fun abort(why: String, e: Throwable?) = connection.abort(why, e)

    override fun getConfiguration() = conf

    override fun getAdmin(): Admin = connection.admin

    override fun getTableBuilder(tableName: TableName, pool: ExecutorService?): TableBuilder = connection.getTableBuilder(tableName, pool)

    override fun close() = connection.close()

    override fun isClosed(): Boolean = connection.isClosed

    fun getTableIfExists(tableName: TableName) = if (admin.tableExists(tableName)) getTable(tableName) else null

}
