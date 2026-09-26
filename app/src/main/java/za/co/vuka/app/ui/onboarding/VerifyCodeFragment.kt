package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.app.AlertDialog
import android.graphics.Typeface
import android.os.CountDownTimer
import android.text.InputFilter
import android.text.InputType
import android.util.Patterns
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import androidx.core.view.children
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import com.google.android.material.button.MaterialButton
import com.google.android.material.dialog.MaterialAlertDialogBuilder

/**
 * Onboarding step 5 — Verify code. Six one-digit boxes and an on-screen keypad.
 *
 * SIMULATED: no SMS provider exists yet, so [submit] accepts any complete code.
 * The WRONG / EXPIRED / LOCKED states match VerifyCode.tsx. A real
 * verification call can set them; nothing does today.
 *
 * The code can go by text or by email. If the member picks one they haven't
 * given (the number was skipped, or there's no email on the phone route),
 * they're asked for it first and the code goes there.
 */
class VerifyCodeFragment : Fragment(R.layout.fragment_verify_code) {

    private enum class CodeState { IDLE, WRONG, EXPIRED, LOCKED }

    private var value = ""
    private var state = CodeState.IDLE
    private var attemptsLeft = MAX_ATTEMPTS
    private var secondsLeft = RESEND_SECONDS
    private var timer: CountDownTimer? = null
    private var codeByEmail = false

    private lateinit var boxes: List<TextView>
    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // No number (skipped on the email route): the code goes to the email.
        codeByEmail = onboardingViewModel.phoneNumber.value.isBlank()
        savedInstanceState?.let {
            codeByEmail = it.getBoolean(KEY_BY_EMAIL, codeByEmail)
            value =it.getString(KEY_VALUE).orEmpty()
            state = CodeState.valueOf(it.getString(KEY_STATE) ?: CodeState.IDLE.name)
            attemptsLeft = it.getInt(KEY_ATTEMPTS, MAX_ATTEMPTS)
            secondsLeft = it.getInt(KEY_SECONDS, RESEND_SECONDS)
        }

        boxes = view.findViewById<ViewGroup>(R.id.codeBoxes).children.map { it as TextView }.toList()

        view.findViewById<ViewGroup>(R.id.keypad).children
            .filterIsInstance<TextView>()
            .forEach { key -> key.setOnClickListener { onDigit(key.text.toString()) } }

        view.findViewById<View>(R.id.keyDelete).setOnClickListener {
            if (state == CodeState.LOCKED) return@setOnClickListener
            value = value.dropLast(1)
            render()
        }

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            findNavController().navigateUp()
        }

        view.findViewById<TextView>(R.id.tvResend).setOnClickListener {
            if (secondsLeft == 0) resend()
        }

        view.findViewById<MaterialButton>(R.id.btnResend).setOnClickListener { resend() }

        // The member chooses where the code goes. Sign-in checks the number, so it stays on text.
        view.findViewById<View>(R.id.channelOptions).visibility =
            if (onboardingViewModel.signingIn) View.GONE else View.VISIBLE
        view.findViewById<View>(R.id.channelSms).setOnClickListener { selectChannel(byEmail = false) }
        view.findViewById<View>(R.id.channelEmail).setOnClickListener { selectChannel(byEmail = true) }

        render()
        renderChannel()
        startTimer()
    }

    private fun selectChannel(byEmail: Boolean) {
        if (codeByEmail == byEmail) return
        val missing = if (byEmail) onboardingViewModel.email.value.isBlank()
        else onboardingViewModel.phoneNumber.value.isBlank()
        if (missing) {
            askForContact(byEmail)
            return
        }
        codeByEmail = byEmail
        renderChannel()
        resend() // a new code goes to the newly chosen place
    }

    /** Asks for the email or number the member didn't give, then sends the code there. */
    private fun askForContact(byEmail: Boolean) {
        val container = layoutInflater.inflate(R.layout.dialog_contact_input, null)
        container.findViewById<TextView>(R.id.tvLabel).text = if (byEmail) "Email" else "Mobile number"
        container.findViewById<View>(R.id.tvPrefix).visibility = if (byEmail) View.GONE else View.VISIBLE
        val error = container.findViewById<View>(R.id.errorContainer)
        val input = container.findViewById<EditText>(R.id.etValue).apply {
            if (byEmail) {
                inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
                hint = "you@example.com"
            } else {
                inputType = InputType.TYPE_CLASS_NUMBER
                typeface = Typeface.MONOSPACE
                hint = "82 555 0101"
                filters = arrayOf(InputFilter.LengthFilter(9))
            }
        }
        val dialog = MaterialAlertDialogBuilder(requireContext())
            .setTitle(if (byEmail) "Add your email" else "Add your mobile number")
            .setMessage(
                if (byEmail) "We'll send the code to this address."
                else "We'll text the code to this number: +27, then 9 digits not starting with 0."
            )
            .setView(container)
            .setPositiveButton("Send code", null)
            .setNegativeButton("Cancel", null)
            .create()
        dialog.setOnShowListener {
            // Checked before closing, so a typo keeps the dialog open.
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val text = input.text.toString().trim()
                val ok = if (byEmail) Patterns.EMAIL_ADDRESS.matcher(text).matches()
                else saMobilePattern.matches(text)
                if (!ok) {
                    container.findViewById<TextView>(R.id.tvError).text = if (byEmail) {
                        "Enter a valid email address."
                    } else {
                        "Enter a valid South African mobile number — 9 digits, not starting with 0."
                    }
                    error.visibility = View.VISIBLE
                    return@setOnClickListener
                }
                if (byEmail) onboardingViewModel.setContactEmail(text)
                else onboardingViewModel.setPhoneNumber("+27$text")
                dialog.dismiss()
                selectChannel(byEmail)
            }
        }
        dialog.show()
    }

    private fun renderChannel() {
        val view = view ?: return
        val phone = onboardingViewModel.phoneNumber.value
        view.findViewById<TextView>(R.id.tvIntro).text = if (codeByEmail) {
            "Enter the 6-digit code we sent to ${onboardingViewModel.email.value}."
        } else {
            "Enter the 6-digit code we sent by text to ${phone.ifBlank { "your phone" }}."
        }
        view.findViewById<View>(R.id.channelSms)
            .setBackgroundResource(if (codeByEmail) R.drawable.bg_tab_inactive else R.drawable.bg_input_field_error)
        view.findViewById<View>(R.id.channelEmail)
            .setBackgroundResource(if (codeByEmail) R.drawable.bg_input_field_error else R.drawable.bg_tab_inactive)
    }

    override fun onDestroyView() {
        timer?.cancel()
        super.onDestroyView()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putBoolean(KEY_BY_EMAIL, codeByEmail)
        outState.putString(KEY_VALUE, value)
        outState.putString(KEY_STATE, state.name)
        outState.putInt(KEY_ATTEMPTS, attemptsLeft)
        outState.putInt(KEY_SECONDS, secondsLeft)
    }

    private fun onDigit(digit: String) {
        if (state == CodeState.LOCKED || value.length >= CODE_LENGTH) return
        value += digit
        render()
        if (value.length == CODE_LENGTH) submit(value)
    }

    private fun submit(code: String) {
        // SIMULATED — replace with the real check. On a wrong code: set
        // state = WRONG, decrement attemptsLeft (LOCKED at 0) and clear value.
        value = ""
        render()
        val existing = onboardingViewModel.isRegistered(onboardingViewModel.phoneNumber.value)
        if (onboardingViewModel.signingIn && !existing) {
            // Signing in, but this number has no account on this phone: say so and offer both ways on.
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("No account found")
                .setMessage("There's no VUKA account for this number on this phone.")
                .setPositiveButton("Create an account") { _, _ ->
                    onboardingViewModel.signingIn = false
                    findNavController().navigate(R.id.action_verifyCode_to_yourName)
                }
                .setNegativeButton("Try another number") { _, _ -> findNavController().navigateUp() }
                .show()
            return
        }
        findNavController().navigate(
            if (existing) R.id.action_verifyCode_to_welcomeBack else R.id.action_verifyCode_to_yourName
        )
    }

    private fun resend() {
        // SIMULATED — no SMS is sent; this only restarts the countdown.
        state = CodeState.IDLE
        value = ""
        secondsLeft = RESEND_SECONDS
        render()
        startTimer()
    }

    private fun startTimer() {
        timer?.cancel()
        if (state == CodeState.LOCKED || secondsLeft == 0) return
        timer = object : CountDownTimer(secondsLeft * 1000L, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                secondsLeft = ((millisUntilFinished + 999) / 1000).toInt()
                renderResendText()
            }

            override fun onFinish() {
                secondsLeft = 0
                renderResendText()
            }
        }.start()
    }

    private fun render() {
        val view = view ?: return
        val locked = state == CodeState.LOCKED

        boxes.forEachIndexed { i, box ->
            val digit = value.getOrNull(i)
            box.text = digit?.toString().orEmpty()
            box.setBackgroundResource(
                if (digit != null) R.drawable.bg_input_field_error else R.drawable.bg_input_field
            )
            box.setTextColor(
                requireContext().getColor(if (locked) R.color.vuka_text_dim else R.color.vuka_text_title)
            )
        }
        view.findViewById<View>(R.id.codeBoxes).contentDescription =
            "Code, ${value.length} of $CODE_LENGTH digits entered"

        val idle = state == CodeState.IDLE
        view.findViewById<View>(R.id.keypadContainer).visibility = if (idle) View.VISIBLE else View.GONE

        val resendButton = view.findViewById<MaterialButton>(R.id.btnResend)
        resendButton.visibility = if (idle) View.GONE else View.VISIBLE
        resendButton.isEnabled = !locked
        resendButton.alpha = if (locked) 0.4f else 1f

        val error = when (state) {
            CodeState.IDLE -> null
            CodeState.WRONG ->
                if (attemptsLeft > 0) {
                    "That code isn't right. $attemptsLeft attempt${if (attemptsLeft == 1) "" else "s"} left."
                } else {
                    "That code isn't right. Try again in 15 minutes."
                }
            CodeState.EXPIRED -> "This code has expired. Request a new one."
            CodeState.LOCKED -> "Too many attempts. Try again in 15 minutes."
        }
        view.findViewById<View>(R.id.errorContainer).visibility = if (error != null) View.VISIBLE else View.GONE
        view.findViewById<TextView>(R.id.tvError).text = error

        renderResendText()
    }

    private fun renderResendText() {
        val tv = view?.findViewById<TextView>(R.id.tvResend) ?: return
        tv.text = if (secondsLeft > 0) {
            "Resend in %d:%02d".format(secondsLeft / 60, secondsLeft % 60)
        } else {
            "Didn't get it? Resend the code."
        }
        tv.isClickable = secondsLeft == 0
    }

    companion object {
        private const val CODE_LENGTH = 6
        private const val MAX_ATTEMPTS = 5
        private const val RESEND_SECONDS = 45

        private const val KEY_BY_EMAIL = "verify_by_email"
        private const val KEY_VALUE ="verify_value"
        private const val KEY_STATE = "verify_state"
        private const val KEY_ATTEMPTS = "verify_attempts"
        private const val KEY_SECONDS = "verify_seconds"
    }
}
