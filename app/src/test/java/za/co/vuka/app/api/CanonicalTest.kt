package za.co.vuka.app.api

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.security.MessageDigest

/**
 * T01 for the Kotlin canonicaliser: every golden vector in
 * contracts/vectors/canonical.json gives the exact bytes and SHA-256, and
 * every rejection vector is refused, as in the JS and Python implementations.
 */
class CanonicalTest {

    @Suppress("UNCHECKED_CAST")
    private val vectors: Map<String, Any?> by lazy {
        val file = listOf("../contracts/vectors/canonical.json", "contracts/vectors/canonical.json").map(::File).first { it.exists() }
        Canonical.parse(file.readText(Charsets.UTF_8)) as Map<String, Any?>
    }

    private fun hex(b: ByteArray) = b.joinToString("") { "%02x".format(it) }

    @Suppress("UNCHECKED_CAST")
    @Test fun `golden vectors give the exact bytes and hash`() {
        val golden = vectors["golden"] as List<Map<String, Any?>>
        assertTrue(golden.size >= 9)
        for (g in golden) {
            val bytes = Canonical.bytes(g["input"])
            assertEquals("bytes for ${g["name"]}", g["bytes"], hex(bytes))
            assertEquals("sha256 for ${g["name"]}", g["sha256"], hex(MessageDigest.getInstance("SHA-256").digest(bytes)))
        }
    }

    @Suppress("UNCHECKED_CAST")
    @Test fun `rejection vectors are refused`() {
        val rejections = vectors["rejections"] as List<Map<String, Any?>>
        assertEquals(5, rejections.size)
        for (r in rejections) {
            assertThrows("should refuse ${r["name"]}", Canonical.CanonicalisationError::class.java) {
                Canonical.fromJsonText(r["json"] as String)
            }
        }
    }

    @Test fun `in-memory floats and unsafe integers are refused`() {
        assertThrows(Canonical.CanonicalisationError::class.java) { Canonical.json(mapOf("score" to 0.5)) }
        assertThrows(Canonical.CanonicalisationError::class.java) { Canonical.json(mapOf("big" to 9_007_199_254_740_992L)) }
        assertThrows(Canonical.CanonicalisationError::class.java) { Canonical.json(mapOf("têxt" to "v")) }
    }

    @Test fun `keys sort and control characters escape like Python`() {
        assertEquals("{\"a\":[true,null],\"b\":\"x\\ny\\u007f\"}", Canonical.json(mapOf("b" to "x\ny\u007f", "a" to listOf(true, null))))
    }
}
