package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import com.google.android.material.button.MaterialButton

// South African mobile numbers: 9 digits after the country code, not starting with 0.
internal val saMobilePattern = Regex("^[1-9][0-9]{8}$")

/**
 * The +27 number. Required on the phone route and for sign-in; optional when
 * the member signed up with Google or email, because the code can go to the
 * email instead. It can still be added on the code screen.
 */
class PhoneNumberFragment : Fragment(R.layout.fragment_phone_number) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val etPhone = view.findViewById<EditText>(R.id.etPhone)

        // Google and email routes: the account already has an email, so the number is optional.
        val email = onboardingViewModel.email.value
        val optional = email.isNotBlank() && !onboardingViewModel.signingIn
        if (optional) {
            view.findViewById<TextView>(R.id.tvIntro).text =
                "Optional. Add your mobile number and we'll text the code there, or skip and we'll email it."
            view.findViewById<TextView>(R.id.tvGoogleAccount).apply {
                text = if (onboardingViewModel.googleUsed.value) "Google · $email · simulated" else "Email · $email"
                visibility = View.VISIBLE
            }
        }
        view.findViewById<View>(R.id.btnSkip).apply {
            visibility = if (optional) View.VISIBLE else View.GONE
            setOnClickListener {
                onboardingViewModel.setPhoneNumber("")
                findNavController().navigate(R.id.action_phoneNumber_to_verifyCode)
            }
        }
        val errorContainer = view.findViewById<View>(R.id.errorContainer)

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            findNavController().navigateUp()
        }

        view.findViewById<MaterialButton>(R.id.btnSend).setOnClickListener {
            val digits = etPhone.text.toString()

            if (!saMobilePattern.matches(digits)) {
                errorContainer.visibility = View.VISIBLE
                return@setOnClickListener
            }

            errorContainer.visibility = View.GONE
            onboardingViewModel.setPhoneNumber("+27$digits")
            findNavController().navigate(R.id.action_phoneNumber_to_verifyCode)
        }
    }
}