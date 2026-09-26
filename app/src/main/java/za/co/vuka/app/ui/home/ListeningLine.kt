package za.co.vuka.app.ui.home

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import android.os.Build
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import androidx.core.graphics.ColorUtils
import za.co.vuka.app.R
import za.co.vuka.app.ui.settings.vukaColor

/**
 * The signature "listening" line from ListeningLine.tsx. It is a soft wave in
 * the action colour at 40%, fading out at both ends.
 *
 * The wave drifts sideways while the microphone is really recording (Home
 * shows it only when [za.co.vuka.app.detect.Listening] is On), as in the
 * prototype. It stops when animations are off on the phone.
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
    private val shaderMatrix = Matrix()
    private var phase = 0f

    private val drift = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = 2400L
        repeatCount = ValueAnimator.INFINITE
        interpolator = LinearInterpolator()
        addUpdateListener {
            phase = (it.animatedValue as Float) * period
            invalidate()
        }
    }

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

        // One extra period on the left, so the wave can slide right without a gap.
        val mid = h / 2f
        path.reset()
        path.moveTo(-period, mid)
        var x = -period
        var up = true
        while (x < w) {
            val half = period / 2
            path.quadTo(x + half / 2, if (up) mid - 2 * amplitude else mid + 2 * amplitude, x + half, mid)
            x += half
            up = !up
        }
    }

    override fun onDraw(canvas: Canvas) {
        // Move the wave, but keep the fade at the edges where it is.
        shaderMatrix.setTranslate(-phase, 0f)
        paint.shader?.setLocalMatrix(shaderMatrix)
        canvas.save()
        canvas.translate(phase, 0f)
        canvas.drawPath(path, paint)
        canvas.restore()
    }

    override fun onVisibilityAggregated(isVisible: Boolean) {
        super.onVisibilityAggregated(isVisible)
        // Android 7 can't report the setting; there the animator itself honours it.
        val animationsOn = Build.VERSION.SDK_INT < Build.VERSION_CODES.O || ValueAnimator.areAnimatorsEnabled()
        if (isVisible && animationsOn) {
            if (!drift.isStarted) drift.start()
        } else {
            drift.cancel()
            phase = 0f
        }
    }

    override fun onDetachedFromWindow() {
        drift.cancel()
        super.onDetachedFromWindow()
    }
}
