package za.co.vuka.app.ui.onboarding

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import za.co.vuka.app.R
import za.co.vuka.app.ui.settings.vukaColor

/**
 * SIMULATED QR block from shared.tsx (QrBlock). A fixed 9×9 pattern that
 * encodes nothing. Always shown next to a "SIMULATED" caption.
 */
class SimulatedQrView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {

    private val density = resources.displayMetrics.density
    private val inset = 8 * density
    private val radius = 12 * density

    private val cardPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFFFFFFF.toInt() }
    private val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = density
        color = context.vukaColor(R.color.vuka_border)
    }
    private val cellPaint = Paint().apply { color = context.getColor(R.color.vuka_text_title) }
    private val rect = RectF()

    init {
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
    }

    override fun onDraw(canvas: Canvas) {
        rect.set(density / 2, density / 2, width - density / 2, height - density / 2)
        canvas.drawRoundRect(rect, radius, radius, cardPaint)
        canvas.drawRoundRect(rect, radius, radius, borderPaint)

        val cell = (width - 2 * inset) / CELLS
        PATTERN.forEachIndexed { i, on ->
            if (on == 0) return@forEachIndexed
            val left = inset + (i % CELLS) * cell
            val top = inset + (i / CELLS) * cell
            canvas.drawRect(left, top, left + cell, top + cell, cellPaint)
        }
    }

    private companion object {
        const val CELLS = 9
        val PATTERN = intArrayOf(
            1, 1, 1, 0, 1, 0, 1, 1, 1,
            1, 0, 1, 0, 0, 0, 1, 0, 1,
            1, 0, 1, 1, 0, 1, 1, 0, 1,
            0, 0, 0, 1, 1, 0, 0, 0, 0,
            1, 1, 0, 0, 1, 0, 1, 1, 0,
            0, 0, 1, 0, 1, 1, 0, 0, 1,
            1, 0, 1, 1, 0, 1, 1, 0, 1,
            1, 0, 1, 0, 0, 0, 1, 0, 1,
            1, 1, 1, 0, 1, 0, 1, 1, 1,
        )
    }
}
