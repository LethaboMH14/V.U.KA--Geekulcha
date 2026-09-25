package za.co.vuka.app.panic

import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.os.Bundle
import android.util.AttributeSet
import android.util.TypedValue
import android.view.HapticFeedbackConstants
import android.view.MotionEvent
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import android.view.animation.LinearInterpolator
import androidx.core.graphics.withClip
import za.co.vuka.app.R

/**
 * "Hold for help": fires [onTriggered] only after a continuous 2-second
 * hold, so a pocket or a stray tap can't send it. Releasing early cancels.
 * The ink fill grows left to right while held.
 *
 * TalkBack users can't easily hold, so the view also exposes a "Send alert"
 * accessibility action that triggers directly.
 */
class HoldToAlertButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {

    var onTriggered: (() -> Unit)? = null

    private val density = resources.displayMetrics.density
    private val radius = 27 * density
    private val rect = RectF()
    private val fillRect = RectF()

    private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = context.getColor(R.color.vuka_card_solid)
    }
    private val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 1.5f * density
        color = context.getColor(R.color.vuka_text_title)
    }
    private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = context.getColor(R.color.vuka_action_grad_bottom)
    }
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = Paint.Align.CENTER
        textSize = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, 16f, resources.displayMetrics)
        isFakeBoldText = true
    }

    private var progress = 0f
    private val animator = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = HOLD_MS
        interpolator = LinearInterpolator()
        addUpdateListener {
            progress = it.animatedValue as Float
            invalidate()
            if (progress >= 1f) trigger()
        }
    }

    init {
        isClickable = true
        isFocusable = true
        contentDescription = "Hold for help. Hold for 2 seconds to send an alert."
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        setMeasuredDimension(
            getDefaultSize(suggestedMinimumWidth, widthMeasureSpec),
            resolveSize((54 * density).toInt(), heightMeasureSpec),
        )
    }

    override fun onDraw(canvas: Canvas) {
        val inset = borderPaint.strokeWidth / 2
        rect.set(inset, inset, width - inset, height - inset)
        canvas.drawRoundRect(rect, radius, radius, trackPaint)

        if (progress > 0f) {
            fillRect.set(0f, 0f, width * progress, height.toFloat())
            canvas.withClip(fillRect) { drawRoundRect(rect, radius, radius, fillPaint) }
        }
        canvas.drawRoundRect(rect, radius, radius, borderPaint)

        // Text switches to white once the ink fill passes the middle.
        textPaint.color = context.getColor(if (progress > 0.5f) R.color.vuka_text_inverse else R.color.vuka_text_title)
        val label = if (progress > 0f) "Keep holding…" else "Hold for help"
        val y = height / 2f - (textPaint.descent() + textPaint.ascent()) / 2
        canvas.drawText(label, width / 2f, y, textPaint)
    }

    @SuppressLint("ClickableViewAccessibility") // performClick is replaced by the explicit accessibility action below
    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                parent?.requestDisallowInterceptTouchEvent(true)
                performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY)
                animator.start()
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> reset()
        }
        return true
    }

    override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
        super.onInitializeAccessibilityNodeInfo(info)
        info.addAction(AccessibilityNodeInfo.AccessibilityAction(AccessibilityNodeInfo.ACTION_CLICK, "Send alert"))
    }

    override fun performAccessibilityAction(action: Int, arguments: Bundle?): Boolean {
        if (action == AccessibilityNodeInfo.ACTION_CLICK) {
            onTriggered?.invoke()
            return true
        }
        return super.performAccessibilityAction(action, arguments)
    }

    override fun onDetachedFromWindow() {
        animator.cancel()
        super.onDetachedFromWindow()
    }

    private fun trigger() {
        animator.cancel()
        performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
        progress = 0f
        invalidate()
        onTriggered?.invoke()
    }

    private fun reset() {
        animator.cancel()
        progress = 0f
        invalidate()
    }

    private companion object {
        const val HOLD_MS = 2000L
    }
}
