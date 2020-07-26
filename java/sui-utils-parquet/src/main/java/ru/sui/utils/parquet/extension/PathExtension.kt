package ru.sui.utils.parquet.extension

import org.apache.hadoop.fs.Path
import ru.sui.utils.hdfs.extension.append


fun Path.append(params: Iterable<Pair<String, Any>>): Path = params.fold(this, { result, (key, value) -> result.append("$key=$value") })

fun Path.append(vararg params: Pair<String, Any>): Path = this.append(params.toList())
