package za.co.vuka.app.ui.home

import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import androidx.core.graphics.ColorUtils
import za.co.vuka.app.R
import za.co.vuka.app.ui.settings.vukaColor

/**
 * The signature "listening" line from ListeningLine.tsx. It is a soft wave in
 * the action colour at 40%, fading out at both ends.
 *
 * Drawn STILL on purpose. In the prototype the wave drifts while VIGIL listens.
 * Nothing listens in this build yet, so a moving line would claim protection
 * that isn't there. Add the drift when the listener is real.
 */
class ListeningLine @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {

    private val density = resources.displayMetrics.density
    private val period = 60 * density
    private val amplitude = 4.5f * density

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2 * density
        strokeCap = Paint.Cap.ROUND
    }
    private val path = Path()

    init {
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        val line = ColorUtils.setAlphaComponent(context.vukaColor(R.color.vuka_action), 0x66)
        val clear = ColorUtils.setAlphaComponent(line, 0)
        // Transparent → colour at 12% → colour at 88% → transparent, like the CSS mask.
        paint.shader = LinearGradient(
            0f, 0f, w.toFloat(), 0f,
            intArrayOf(clear, line, line, clear),
            floatArrayOf(0f, 0.12f, 0.88f, 1f),
            Shader.TileMode.CLAMP
        )

        val mid = h / 2f
        path.reset()
        path.moveTo(0f, mid)
        var x = 0f
        var up = true
        while (x < w) {
            val half = period / 2
            path.quadTo(x + half / 2, if (up) mid - 2 * amplitude else mid + 2 * amplitude, x + half, mid)
            x += half
            up = !up
        }
    }

    override fun onDraw(canvas: Canvas) {
        canvas.drawPath(path, paint)
    }
}
