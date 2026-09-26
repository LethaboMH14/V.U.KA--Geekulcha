package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.EditText
import android.widget.TextView
import androidx.core.os.bundleOf
import za.co.vuka.app.R
import za.co.vuka.app.auth.AccountStore
import za.co.vuka.app.auth.InterimPasswordStore
import za.co.vuka.app.ui.record.RecordEntry
import za.co.vuka.app.ui.record.RecordStore
import za.co.vuka.app.ui.settings.maskEmail
import za.co.vuka.app.ui.settings.maskPhone
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.button.MaterialButton

/**
 * "Forgot password?" on sign-in: the account email, then a code sent to the
 * recovery contact chosen in Settings → Recovery, then a new password.
 * Resets the email sign-in password only; the PIN is never reset this way
 * (spec §9), and the member still enters it on "Welcome back".
 *
 * SIMULATED: no SMS or email service, so any 6 digits continue, and the sheet
 * says so. LOCAL ONLY: only an account on this phone can be reset.
 */
class ForgotPasswordSheet : BottomSheetDialogFragment(R.layout.dialog_forgot_password) {

    private var codeSent = false

    override fun getTheme() = R.style.ThemeOverlay_Vuka_BottomSheet

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        codeSent = savedInstanceState?.getBoolean(KEY_SENT) ?: false
        (dialog as? BottomSheetDialog)?.behavior?.apply {
            state = BottomSheetBehavior.STATE_EXPANDED
            skipCollapsed = true
        }
        val etEmail = view.findViewById<EditText>(R.id.etEmail)
        if (savedInstanceState == null) etEmail.setText(arguments?.getString(ARG_EMAIL).orEmpty())

        view.findViewById<View>(R.id.btnClose).setOnClickListener { dismiss() }
        view.findViewById<View>(R.id.btnPrimary).setOnClickListener {
            if (codeSent) resetPassword(view) else sendCode(view)
        }
        render(view)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putBoolean(KEY_SENT, codeSent)
    }

    private fun sendCode(view: View) {
        val email = view.findViewById<EditText>(R.id.etEmail).text.toString().trim()
        val passwords = InterimPasswordStore(requireContext())
        when {
            !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> return showError(view, "Enter a valid email address.")
            !passwords.hasPassword() || !passwords.isAccountEmail(email) ->
                return showError(view, "There's no VUKA account with an email password for that address on this phone.")
        }
        codeSent = true
        hideError(view)
        render(view)
    }

    private fun resetPassword(view: View) {
        val email = view.findViewById<EditText>(R.id.etEmail).text.toString().trim()
        val code = view.findViewById<EditText>(R.id.etCode).text.toString()
        val etPassword = view.findViewById<EditText>(R.id.etPassword)
        val etConfirm = view.findViewById<EditText>(R.id.etConfirm)
        val password = etPassword.text.toString()
        val message = when {
            code.length != 6 -> "Enter the 6-digit code."
            password.length < MIN_PASSWORD -> "Use at least $MIN_PASSWORD characters for your password."
            password != etConfirm.text.toString() -> "Those two passwords don't match."
            else -> null
        }
        if (message != null) return showError(view, message)

        InterimPasswordStore(requireContext()).set(email, password)
        etPassword.text.clear()
        etConfirm.text.clear()
        val via = when (AccountStore(requireContext()).recoveryChannel) {
            AccountStore.RecoveryChannel.PHONE -> "via mobile number"
            else -> "via email"
        }
        RecordStore.add(requireContext(), RecordEntry.Kind.PASSWORD_RESET, via)
        parentFragmentManager.setFragmentResult(RESULT_KEY, bundleOf())
        dismiss()
    }

    private fun render(view: View) {
        view.findViewById<View>(R.id.stepEmail).visibility = if (codeSent) View.GONE else View.VISIBLE
        view.findViewById<View>(R.id.stepReset).visibility = if (codeSent) View.VISIBLE else View.GONE
        view.findViewById<MaterialButton>(R.id.btnPrimary).text = if (codeSent) "Save new password" else "Send code"
        if (codeSent) {
            val profile = AccountStore(requireContext()).profile()
            val destination = when (AccountStore(requireContext()).recoveryChannel) {
                AccountStore.RecoveryChannel.PHONE -> "your mobile number, ${maskPhone(profile?.phone.orEmpty())}"
                else -> "your email, ${maskEmail(profile?.email.orEmpty())}"
            }
            view.findViewById<TextView>(R.id.tvIntro).text = "Enter the code we sent to $destination, then choose a new password."
        }
    }

    private fun showError(view: View, message: String) {
        view.findViewById<TextView>(R.id.tvError).text = message
        view.findViewById<View>(R.id.errorContainer).visibility = View.VISIBLE
    }

    private fun hideError(view: View) {
        view.findViewById<View>(R.id.errorContainer).visibility = View.GONE
    }

    companion object {
        const val RESULT_KEY = "password_reset_done"
        private const val ARG_EMAIL = "email"
        private const val KEY_SENT = "code_sent"
        private const val MIN_PASSWORD = 8

        fun newInstance(email: String) = ForgotPasswordSheet().apply { arguments = bundleOf(ARG_EMAIL to email) }
    }
}
