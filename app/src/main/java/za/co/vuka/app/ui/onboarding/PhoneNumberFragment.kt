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

class PhoneNumberFragment : Fragment(R.layout.fragment_phone_number) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    // South African mobile numbers: 9 digits after the country code, not starting with 0.
    private val validPattern = Regex("^[1-9][0-9]{8}$")

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val etPhone = view.findViewById<EditText>(R.id.etPhone)

        // Google and email routes: the account exists, but alerts and verification still need a +27 number.
        val email = onboardingViewModel.email.value
        if (email.isNotBlank() && !onboardingViewModel.signingIn) {
            view.findViewById<TextView>(R.id.tvIntro).text =
                "Add your mobile number too. VIGIL uses it for alerts, and we'll send a code to check it's really you."
            view.findViewById<TextView>(R.id.tvGoogleAccount).apply {
                text = if (onboardingViewModel.googleUsed.value) "Google · $email · simulated" else "Email · $email"
                visibility = View.VISIBLE
            }
        }
        val errorContainer = view.findViewById<View>(R.id.errorContainer)

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            findNavController().navigateUp()
        }

        view.findViewById<MaterialButton>(R.id.btnSend).setOnClickListener {
            val digits = etPhone.text.toString()

            if (!validPattern.matches(digits)) {
                errorContainer.visibility = View.VISIBLE
                return@setOnClickListener
            }

            errorContainer.visibility = View.GONE
            onboardingViewModel.setPhoneNumber("+27$digits")
            findNavController().navigate(R.id.action_phoneNumber_to_verifyCode)
        }
    }
}