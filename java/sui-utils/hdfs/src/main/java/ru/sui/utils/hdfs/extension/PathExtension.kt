package ru.sui.utils.hdfs.extension

import org.apache.hadoop.fs.Path


fun Path.append(text: String) = Path(this, text)

fun Path.appendLeft(text: String) = Path(text, if (this.isAbsolute) this.toString().substring(1) else this.toString())
