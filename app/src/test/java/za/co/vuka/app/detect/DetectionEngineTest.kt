package za.co.vuka.app.detect

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The V4 prompt path, checked against the same cases as the React Native
 * app's app/src/brain/detect/__tests__/engine.test.ts, so both engines agree.
 */
class DetectionEngineTest {

    private val labels = DetectionEngine.TARGETS.map { it.label }

    /** A window scoring `scores` (label → bp), everything else 0. */
    private fun window(seq: Int, endMs: Long, scores: Map<String, Int>, neighbour: Int = 0) =
        WindowResult(seq, endMs, IntArray(labels.size) { scores[labels[it]] ?: 0 }, neighbour)

    @Test fun `thresholds match RULESET_V1`() {
        val t = DetectionEngine.TARGETS.associate { it.label to it.thresholdBp }
        assertEquals(mapOf(
            "Shout" to 6000, "Yell" to 6000, "Screaming" to 4500,
            "Gunshot, gunfire" to 3500, "Machine gun" to 3500, "Fusillade" to 3500,
            "Glass" to 3500, "Shatter" to 3000, "Breaking" to 4000,
        ), t)
    }

    @Test fun `records and prompts on one glass window at threshold`() {
        val d = DetectionEngine().step(window(1, 1000, mapOf("Glass" to 3500)))
        assertNotNull(d)
        assertEquals("Glass", d!!.label)
        assertTrue(d.prompt)
    }

    @Test fun `does not record one basis point below threshold`() {
        assertNull(DetectionEngine().step(window(1, 1000, mapOf("Glass" to 3499))))
    }

    @Test fun `does not record when a neighbour outscores the gunshot`() {
        assertNull(DetectionEngine().step(window(1, 1000, mapOf("Gunshot, gunfire" to 5000), neighbour = 6000)))
    }

    @Test fun `records when the gunshot is the stronger of the two`() {
        assertEquals("Gunshot, gunfire", DetectionEngine().step(window(1, 1000, mapOf("Gunshot, gunfire" to 6000), neighbour = 5000))?.label)
    }

    @Test fun `neighbour rule applies only to gun-like classes`() {
        assertEquals("Glass", DetectionEngine().step(window(1, 1000, mapOf("Glass" to 4000), neighbour = 9000))?.label)
    }

    @Test fun `a single scream window does not record`() {
        assertNull(DetectionEngine().step(window(1, 1000, mapOf("Screaming" to 9000))))
    }

    @Test fun `one brief sound can't confirm itself in two overlapping windows`() {
        val e = DetectionEngine()
        assertNull(e.step(window(1, 1000, mapOf("Screaming" to 9000))))
        assertNull(e.step(window(2, 1487, mapOf("Screaming" to 9000))))
    }

    @Test fun `records when the voice is still there two windows later, across voice classes`() {
        val e = DetectionEngine()
        assertNull(e.step(window(1, 1000, mapOf("Shout" to 7000))))
        e.step(window(2, 1487, emptyMap()))
        assertEquals("Screaming", e.step(window(3, 1975, mapOf("Screaming" to 5000)))?.label)
    }

    @Test fun `a missing window counts as a miss`() {
        val e = DetectionEngine()
        assertNull(e.step(window(1, 1000, mapOf("Screaming" to 9000))))
        // Window 3 never arrives (the model was busy): 5 needs 3, so no record.
        assertNull(e.step(window(5, 2950, mapOf("Screaming" to 9000))))
    }

    @Test fun `a loud class below its own bar does not hide a quieter one that clears its bar`() {
        assertEquals("Shatter", DetectionEngine().step(window(1, 1000, mapOf("Glass" to 3400, "Shatter" to 3100)))?.label)
    }

    @Test fun `takes the highest qualifying score, ties to the lowest index`() {
        assertEquals("Shatter", DetectionEngine().step(window(1, 1000, mapOf("Glass" to 5000, "Shatter" to 6000)))?.label)
        assertEquals("Glass", DetectionEngine().step(window(1, 1000, mapOf("Glass" to 6000, "Shatter" to 6000)))?.label)
    }

    @Test fun `records again after the record gap but prompts again only after the cooldown`() {
        val e = DetectionEngine()
        assertTrue(e.step(window(1, 1_000, mapOf("Glass" to 5000)))!!.prompt)
        assertNull(e.step(window(2, 4_000, mapOf("Glass" to 5000)))) // within 5 s: duplicate
        val later = e.step(window(20, 7_000, mapOf("Glass" to 5000)))
        assertNotNull(later)
        assertFalse(later!!.prompt) // within 30 s of the last prompt
        assertTrue(e.step(window(80, 32_000, mapOf("Glass" to 5000)))!!.prompt)
    }

    @Test fun `keeps different families apart for duplicates`() {
        val e = DetectionEngine()
        assertNotNull(e.step(window(1, 1000, mapOf("Glass" to 5000))))
        assertNotNull(e.step(window(2, 1487, mapOf("Gunshot, gunfire" to 5000))))
    }
}
