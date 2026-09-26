package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.text.InputType
import android.util.Patterns
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.auth.InterimPasswordStore

/**
 * "Sign up with email": the member's own email and a password for VUKA, for
 * people whose Google account on this phone isn't the one they want. The
 * +27 number is optional next; the code can go to this email.
 *
 * SIMULATED: no account server exists, so the password is kept only as a
 * salted hash on this phone ([InterimPasswordStore]).
 */
class EmailSignUpFragment : Fragment(R.layout.fragment_email_sign_up) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val etEmail = view.findViewById<EditText>(R.id.etEmail)
        val etPassword = view.findViewById<EditText>(R.id.etPassword)
        val etConfirm = view.findViewById<EditText>(R.id.etConfirm)
        val error = view.findViewById<View>(R.id.errorContainer)
        val tvError = view.findViewById<TextView>(R.id.tvError)

        view.findViewById<View>(R.id.btnBack).setOnClickListener { findNavController().navigateUp() }
        bindPasswordToggle(view.findViewById(R.id.btnTogglePassword), etPassword, etConfirm)

        view.findViewById<View>(R.id.btnContinue).setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()
            val message = when {
                !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Enter a valid email address."
                password.length < MIN_PASSWORD -> "Use at least $MIN_PASSWORD characters for your password."
                password != etConfirm.text.toString() -> "Those two passwords don't match."
                else -> null
            }
            if (message != null) {
                tvError.text = message
                error.visibility = View.VISIBLE
                return@setOnClickListener
            }
            error.visibility = View.GONE
            InterimPasswordStore(requireContext()).set(email, password)
            etPassword.text.clear()
            etConfirm.text.clear()
            onboardingViewModel.setEmailAccount(email)
            findNavController().navigate(R.id.action_emailSignUp_to_phoneNumber)
        }
    }

    private companion object {
        const val MIN_PASSWORD = 8
    }
}

/** Show/hide for password fields. The eye icon swaps and its description says what a tap will do. */
internal fun bindPasswordToggle(toggle: ImageView, vararg fields: EditText) {
    var visible = false
    toggle.setOnClickListener {
        visible = !visible
        val type = InputType.TYPE_CLASS_TEXT or
            if (visible) InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD else InputType.TYPE_TEXT_VARIATION_PASSWORD
        fields.forEach { field ->
            val cursor = field.selectionEnd
            field.inputType = type
            field.setSelection(cursor.coerceAtLeast(0))
        }
        toggle.setImageResource(if (visible) R.drawable.ic_eye_off else R.drawable.ic_eye)
        toggle.contentDescription = if (visible) "Hide password" else "Show password"
    }
}
