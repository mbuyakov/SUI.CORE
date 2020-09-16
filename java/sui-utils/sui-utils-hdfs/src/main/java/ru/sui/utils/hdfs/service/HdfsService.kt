package ru.sui.utils.hdfs.service

import mu.KotlinLogging
import org.apache.hadoop.conf.Configuration
import org.apache.hadoop.fs.CommonConfigurationKeys
import org.apache.hadoop.fs.FileSystem
import org.apache.hadoop.fs.LocalFileSystem
import org.apache.hadoop.fs.Path
import org.apache.hadoop.hdfs.DFSConfigKeys
import org.apache.hadoop.hdfs.DFSUtil
import org.apache.hadoop.hdfs.DistributedFileSystem
import org.apache.hadoop.hdfs.client.HdfsClientConfigKeys
import org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider
import org.springframework.stereotype.Service


private val log = KotlinLogging.logger {  }

@Service
class HdfsService {

    fun createConf(_hdfsHost: String, _user: String?): Configuration {
        var hdfsHost = _hdfsHost
        var user = _user
        val configuration = Configuration()
        // Shadow jar bug. Hadoop 2.7.3+ split hadoop-client and hadoop-hdfs-client to two separated jar. TODO: Spring?
        // https://stackoverflow.com/questions/17265002/hadoop-no-filesystem-for-scheme-file
        configuration["fs.hdfs.impl"] = DistributedFileSystem::class.java.name
        configuration["fs.file.impl"] = LocalFileSystem::class.java.name

        // extract hadoop hosts list
        var pos = hdfsHost.indexOf('?')
        if (pos > 0) {
            val addresses = hdfsHost.substring(pos + 1).split(",").toTypedArray()
            val nameservice = Path(hdfsHost.substring(0, pos)).toUri().host
            val namenodes = StringBuffer()
            for (i in 1..addresses.size) {
                configuration[DFSUtil.addKeySuffixes(DFSConfigKeys.DFS_NAMENODE_RPC_ADDRESS_KEY, nameservice, "nn$i")] = addresses[i - 1]
                if (namenodes.isNotEmpty()) {
                    namenodes.append(',')
                }
                namenodes.append("nn$i")
            }
            configuration[DFSUtil.addKeySuffixes(DFSConfigKeys.DFS_HA_NAMENODES_KEY_PREFIX, nameservice)] = namenodes.toString()
            configuration[DFSConfigKeys.DFS_NAMESERVICES] = nameservice
            configuration[HdfsClientConfigKeys.Failover.PROXY_PROVIDER_KEY_PREFIX + "." + nameservice] = ConfiguredFailoverProxyProvider::class.java.name
            hdfsHost = hdfsHost.substring(0, pos)
        }

        configuration[DFSConfigKeys.DFS_DATANODE_SOCKET_WRITE_TIMEOUT_KEY] = "2000000"
        configuration["dfs.socket.timeout"] = "2000000"

        // extract user name
        pos = hdfsHost.lastIndexOf('@')
        if (pos > 0) {
            val uri = Path(hdfsHost).toUri()
            if (user == null) user = uri.userInfo
            hdfsHost = uri.scheme + "://" + uri.host
        }
        configuration[FileSystem.FS_DEFAULT_NAME_KEY] = hdfsHost
        if (user != null) {
            configuration[CommonConfigurationKeys.HADOOP_SECURITY_SERVICE_USER_NAME_KEY] = user
        }
        return configuration
    }

    fun getInstance(hdfsHost: String, user: String?): FileSystem {
        log.info("init hdfs connection: $hdfsHost / $user")
        val conf = createConf(hdfsHost, user)
        return FileSystem.get(FileSystem.getDefaultUri(conf), conf, user)
    }
    //    public static byte[] getFileHash(FileSystem fs, Path fileName) throws NoSuchAlgorithmException, IOException {
    //        byte[] buffer = new byte[64 * 1024];
    //        MessageDigest hasher = MessageDigest.getInstance("MD5");
    //        try (InputStream in = fs.open(fileName)) {
    //            int len;
    //            while ((len = in.read(buffer)) > -1) {
    //                if (len > 0) hasher.update(buffer, 0, len);
    //            }
    //        }
    //        return hasher.digest();
    //        //val fileAsString: String = new String(fileBytes, StandardCharsets.UTF_8).replaceAll("\r|\n|\t| |\u0000", "")
    //        //.digest(fileAsString.getBytes(StandardCharsets.UTF_8))
    //    }
    //
    //    public static void replace(FileSystem fs, Path file, String from, String to) throws IOException {
    //        if (!fs.isFile(file)) return;
    //        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    //        try (InputStream in = fs.open(file)) {
    //            IOUtils.copy(in, buffer);
    //        }
    //        byte[] data = buffer.toString("UTF-8").replace(from, to).getBytes("UTF-8");
    //        if (data.length != buffer.size()) try (FSDataOutputStream out = fs.create(file, true)) {
    //            out.write(data);
    //        }
    //    }
    //
        fun toHdfsPathString(path: String) = toHdfsPathString(Path(path))

        fun toHdfsPathString(path: Path): String {
            val uri = path.toUri()
            val scheme = uri.scheme?.replaceFirst("webhdfs", "hdfs") ?: "hdfs"
            return scheme + ':' + uri.path.replace(" ", "%20")
        }
    //
    //    public static boolean isHdfsPath(String path, String host) {
    //        return path.contains("hdfs://") || path.startsWith("s3n://") || path.startsWith("s3a://")
    //                || (!path.contains("file://") && (host.contains("hdfs://") || host.startsWith("s3n://") || host.startsWith("s3a://")));
    //    }
    //
    //
    //    public static String fixFileNameForSpark(String fileName) {
    //        return fileName.replaceAll("[: ]", "_");
    //    }
}
