package za.co.vuka.app.panic

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PressCounterTest {

    private fun fires(c: PressCounter, vararg at: Long) = at.map { c.press(it) }

    @Test
    fun fourPressesWithinThreeSecondsFire() {
        assertEquals(listOf(false, false, false, true), fires(PressCounter(), 0, 400, 800, 1200))
    }

    @Test
    fun threePressesDoNot() {
        assertFalse(fires(PressCounter(), 0, 400, 800).any { it })
    }

    @Test
    fun slowPressesDoNot() {
        // Each press more than a second apart: never four inside three seconds.
        assertFalse(fires(PressCounter(), 0, 1100, 2200, 3300, 4400, 5500).any { it })
    }

    @Test
    fun oldPressesFallOutOfTheWindow() {
        val c = PressCounter()
        assertFalse(fires(c, 0, 100, 200).any { it })
        // 3.5 s later the first three have expired; four fresh presses are needed.
        assertEquals(listOf(false, false, false, true), fires(c, 3_700, 3_900, 4_100, 4_300))
    }

    @Test
    fun cooldownStopsASecondFireRightAway() {
        val c = PressCounter()
        assertTrue(fires(c, 0, 200, 400, 600).last())
        assertFalse(fires(c, 1_000, 1_200, 1_400, 1_600).any { it })
        // After the 30 s cooldown the pattern works again.
        assertTrue(fires(c, 40_000, 40_200, 40_400, 40_600).last())
    }

    @Test
    fun fivePressesFireOnceNotTwice() {
        // Android's own Emergency SOS is five presses; VUKA must fire only once in that burst.
        assertEquals(1, fires(PressCounter(), 0, 300, 600, 900, 1200).count { it })
    }
}
