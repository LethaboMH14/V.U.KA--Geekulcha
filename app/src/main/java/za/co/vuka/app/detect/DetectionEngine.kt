package za.co.vuka.app.detect

/**
 * Decides whether a classified window is a detection (spec V4). A Kotlin port
 * of the V4 prompt path in the React Native app's app/src/brain/detect/engine.ts
 * and ruleset.ts (RULESET_V1, version 2), with the same numbers and rules:
 *
 * - each class is judged against its own threshold (no masking);
 * - a gun-like class must also beat its excluded neighbours (ADR-0039(3));
 * - one class per window: the highest qualifying score (ADR-0045);
 * - impulses (glass, gun) confirm in one window; voices need this window AND
 *   the one two before it, which share no audio, so about 1.5 s of voice;
 * - one record per family per 5 s; no second journey check within 30 s.
 *
 * Not ported: the CEM-1 record-only level (PROPOSED) and motion corroboration.
 *
 * UNCALIBRATED: these thresholds are starting values, not measured ones
 * (spec V3, §16). Nothing on screen may present them as tuned.
 * Pure: no clock, no I/O; integers only.
 */
class DetectionEngine {

    enum class Family { VOICE, GLASS, GUN }

    data class Target(val label: String, val family: Family, val thresholdBp: Int)

    data class Decision(val label: String, val family: Family, val scoreBp: Int, val thresholdBp: Int, val prompt: Boolean)

    companion object {
        const val RULESET = "vigil-detect v2 (uncalibrated)"
        const val RECORD_GAP_MS = 5_000L
        const val COOLDOWN_MS = 30_000L

        /** Same labels, order (YAMNet index ascending) and thresholds as RULESET_V1. */
        val TARGETS = listOf(
            Target("Shout", Family.VOICE, 6000),
            Target("Yell", Family.VOICE, 6000),
            Target("Screaming", Family.VOICE, 4500),
            Target("Gunshot, gunfire", Family.GUN, 3500),
            Target("Machine gun", Family.GUN, 3500),
            Target("Fusillade", Family.GUN, 3500),
            Target("Glass", Family.GLASS, 3500),
            Target("Shatter", Family.GLASS, 3000),
            Target("Breaking", Family.GLASS, 4000),
        )

        private fun separation(f: Family) = if (f == Family.VOICE) 2 else 0
    }

    private data class Seen(val seq: Int, val family: Family?)

    private var history = listOf<Seen>()
    private val lastRecordMs = mutableMapOf<Family, Long>()
    private var lastPromptMs: Long? = null

    /** Advance by one window; returns a decision only when the window is recorded. */
    fun step(w: WindowResult): Decision? {
        require(w.targetBp.size == TARGETS.size)

        var winner: Pair<Target, Int>? = null
        TARGETS.forEachIndexed { i, t ->
            val bp = w.targetBp[i]
            if (bp < t.thresholdBp) return@forEachIndexed
            if (t.family == Family.GUN && bp <= w.gunNeighbourBp) return@forEachIndexed
            // Ties go to the lowest YAMNet index: TARGETS is index-sorted, so keep the first.
            if (winner == null || bp > winner!!.second) winner = t to bp
        }

        val kept = history.filter { it.seq > w.seq - 3 && it.seq < w.seq }
        val win = winner
        history = kept + Seen(w.seq, win?.first?.family)
        if (win == null) return null
        val (target, bp) = win

        // Confirmation: impulses in one window; voices in this window and the one two before.
        val sep = separation(target.family)
        val seqs = if (sep == 0) listOf(w.seq) else listOf(w.seq - sep, w.seq)
        if (!seqs.all { s -> history.any { it.seq == s && it.family == target.family } }) return null

        // One record per family per gap, so a long scream is one event, not one per window.
        lastRecordMs[target.family]?.let { if (w.endMs - it < RECORD_GAP_MS) return null }
        lastRecordMs[target.family] = w.endMs

        // No second journey check within the cooldown; the event is still recorded.
        val prompt = lastPromptMs.let { it == null || w.endMs - it >= COOLDOWN_MS }
        if (prompt) lastPromptMs = w.endMs

        return Decision(target.label, target.family, bp, target.thresholdBp, prompt)
    }
}
