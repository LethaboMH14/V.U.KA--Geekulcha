package za.co.vuka.app.api

/**
 * The canonical JSON form of docs/VUKA-2-SPEC.md §5, for the native app: the
 * UTF-8 of Python `json.dumps(obj, sort_keys=True, separators=(",", ":"),
 * ensure_ascii=True)`, byte for byte. A line-for-line port of
 * shared/canonical.js.
 *
 * PROPOSED DEVIATION: §5 rule 5 says "There is no Kotlin canonicaliser". The
 * native app has no JavaScript runtime, so it needs this one to talk to the
 * server. It is held to the same golden and rejection vectors
 * (contracts/vectors/canonical.json) by CanonicalTest; the contract owners
 * must accept it (recorded in the build log).
 *
 * Values: Map<String, Any?> (keys ASCII), List<Any?>, String, Int/Long,
 * Boolean, null. Floats and out-of-range integers are refused.
 */
object Canonical {

    class CanonicalisationError(message: String) : IllegalArgumentException(message)

    private const val MAX_SAFE = 9_007_199_254_740_991L

    fun json(value: Any?): String = StringBuilder().also { encode(value, "$", it) }.toString()

    fun bytes(value: Any?): ByteArray = json(value).toByteArray(Charsets.UTF_8)

    /** Strict parse (duplicate keys, floats, unsafe integers refused), then canonicalise. */
    fun fromJsonText(text: String): String {
        val p = Parser(text)
        val v = p.value()
        p.ws()
        if (!p.atEnd()) throw CanonicalisationError("trailing characters after JSON value")
        return json(v)
    }

    /** Strict parse only: the values this module encodes. */
    fun parse(text: String): Any? {
        val p = Parser(text)
        val v = p.value()
        p.ws()
        if (!p.atEnd()) throw CanonicalisationError("trailing characters after JSON value")
        return v
    }

    private fun encode(value: Any?, path: String, out: StringBuilder) {
        when (value) {
            null -> out.append("null")
            is Boolean -> out.append(if (value) "true" else "false")
            is Int -> out.append(value.toString())
            is Long -> {
                if (value > MAX_SAFE || value < -MAX_SAFE) throw CanonicalisationError("integers must stay within ±(2^53 − 1) (at $path)")
                out.append(value.toString())
            }
            is Float, is Double -> throw CanonicalisationError("no floats in a hashed or signed object (at $path)")
            is String -> escape(value, out)
            is List<*> -> {
                out.append('[')
                value.forEachIndexed { i, item ->
                    if (i > 0) out.append(',')
                    encode(item, "$path[$i]", out)
                }
                out.append(']')
            }
            is Map<*, *> -> {
                val keys = value.keys.map {
                    val k = it as? String ?: throw CanonicalisationError("object keys must be strings (at $path)")
                    if (k.any { c -> c.code > 0x7f }) throw CanonicalisationError("object keys must be ASCII only (at $path)")
                    k
                }.sorted() // ASCII, so code-unit order is code-point order
                out.append('{')
                keys.forEachIndexed { i, k ->
                    if (i > 0) out.append(',')
                    escape(k, out)
                    out.append(':')
                    encode(value[k], "$path.$k", out)
                }
                out.append('}')
            }
            else -> throw CanonicalisationError("type ${value::class.simpleName} is not canonical (at $path)")
        }
    }

    // Python's ESCAPE_ASCII is ([\\"]|[^ -~]): printable ASCII stays literal, the
    // rest escapes. Kotlin strings are UTF-16, so astral characters come out as
    // lowercase surrogate pairs, exactly as Python emits them.
    private fun escape(s: String, out: StringBuilder) {
        out.append('"')
        for (c in s) {
            when {
                c == '"' -> out.append("\\\"")
                c == '\\' -> out.append("\\\\")
                c == '\b' -> out.append("\\b")
                c == '\t' -> out.append("\\t")
                c == '\n' -> out.append("\\n")
                c == '\u000c' -> out.append("\\f")
                c == '\r' -> out.append("\\r")
                c.code in 0x20..0x7e -> out.append(c)
                else -> out.append("\\u").append(c.code.toString(16).padStart(4, '0'))
            }
        }
        out.append('"')
    }

    private class Parser(val text: String) {
        var pos = 0
        fun atEnd() = pos >= text.length
        fun fail(msg: String): Nothing = throw CanonicalisationError("$msg at $pos")
        fun ws() {
            while (!atEnd() && text[pos] in " \t\n\r") pos++
        }

        fun expect(lit: String) {
            if (!text.startsWith(lit, pos)) fail("expected $lit")
            pos += lit.length
        }

        fun value(): Any? {
            ws()
            if (atEnd()) fail("unexpected end of JSON")
            return when (text[pos]) {
                '{' -> obj()
                '[' -> arr()
                '"' -> str()
                't' -> { expect("true"); true }
                'f' -> { expect("false"); false }
                'n' -> { expect("null"); null }
                else -> num()
            }
        }

        fun obj(): Map<String, Any?> {
            expect("{")
            val m = LinkedHashMap<String, Any?>()
            ws()
            if (!atEnd() && text[pos] == '}') { pos++; return m }
            while (true) {
                ws()
                if (atEnd() || text[pos] != '"') fail("expected a string key")
                val k = str()
                if (m.containsKey(k)) throw CanonicalisationError("duplicate key \"$k\" in JSON text")
                ws()
                if (atEnd() || text[pos] != ':') fail("expected ':'")
                pos++
                m[k] = value()
                ws()
                if (atEnd()) fail("expected ',' or '}'")
                when (text[pos]) {
                    ',' -> pos++
                    '}' -> { pos++; return m }
                    else -> fail("expected ',' or '}'")
                }
            }
        }

        fun arr(): List<Any?> {
            expect("[")
            val a = ArrayList<Any?>()
            ws()
            if (!atEnd() && text[pos] == ']') { pos++; return a }
            while (true) {
                a.add(value())
                ws()
                if (atEnd()) fail("expected ',' or ']'")
                when (text[pos]) {
                    ',' -> pos++
                    ']' -> { pos++; return a }
                    else -> fail("expected ',' or ']'")
                }
            }
        }

        fun str(): String {
            pos++ // opening quote
            val sb = StringBuilder()
            while (true) {
                if (atEnd()) fail("unterminated string")
                val c = text[pos]
                when {
                    c == '"' -> { pos++; return sb.toString() }
                    c == '\\' -> {
                        pos++
                        if (atEnd()) fail("unterminated escape")
                        when (val e = text[pos++]) {
                            '"' -> sb.append('"')
                            '\\' -> sb.append('\\')
                            '/' -> sb.append('/')
                            'b' -> sb.append('\b')
                            'f' -> sb.append('\u000c')
                            'n' -> sb.append('\n')
                            'r' -> sb.append('\r')
                            't' -> sb.append('\t')
                            'u' -> {
                                if (pos + 4 > text.length) fail("incomplete \\u escape")
                                val h = text.substring(pos, pos + 4)
                                if (!h.all { it in "0123456789abcdefABCDEF" }) fail("bad \\u escape")
                                sb.append(h.toInt(16).toChar())
                                pos += 4
                            }
                            else -> fail("bad escape \\$e")
                        }
                    }
                    c.code < 0x20 -> fail("raw control character in string")
                    else -> { sb.append(c); pos++ }
                }
            }
        }

        // Anything not lexically an integer is refused: Python reads 1e2 as a float.
        fun num(): Long {
            val m = Regex("^-?(0|[1-9][0-9]*)(\\.[0-9]+)?([eE][+-]?[0-9]+)?").find(text.substring(pos)) ?: fail("not a JSON value")
            pos += m.value.length
            if (m.groupValues[2].isNotEmpty() || m.groupValues[3].isNotEmpty()) {
                throw CanonicalisationError("no floats in a hashed or signed object")
            }
            val v = m.value.toBigInteger()
            if (v > MAX_SAFE.toBigInteger() || v < (-MAX_SAFE).toBigInteger()) {
                throw CanonicalisationError("integers must stay within ±(2^53 − 1)")
            }
            return v.toLong()
        }
    }
}
