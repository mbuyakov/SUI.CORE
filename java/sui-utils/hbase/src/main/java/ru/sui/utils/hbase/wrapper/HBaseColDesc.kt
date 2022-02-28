package ru.sui.utils.hbase.wrapper

import org.apache.hadoop.hbase.util.Bytes


data class HBaseColDesc(val family: ByteArray, val name: ByteArray) {

    val familyAsString
        get() = Bytes.toString(family)
    val nameAsString
        get() = Bytes.toString(name)

    constructor(family: String, name: String): this(Bytes.toBytes(family), Bytes.toBytes(name))

    override fun toString() = "(cf=${String(family)}, col=${String(name)})"

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as HBaseColDesc

        if (!family.contentEquals(other.family)) return false
        if (!name.contentEquals(other.name)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = family.contentHashCode()
        result = 31 * result + name.contentHashCode()
        return result
    }

}

