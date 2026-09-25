package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R

/**
 * Registration, step 2: create an account with Google, with your own email
 * and password, or with just your phone number. Every route verifies the
 * +27 number next, because the spec ties an account to it. Returning
 * members take "Already have an account? Sign in".
 */
class SignInFragment : Fragment(R.layout.fragment_sign_in) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        onboardingViewModel.signingIn = false

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            findNavController().navigateUp()
        }

        childFragmentManager.setFragmentResultListener(
            GoogleAccountChooserDialog.RESULT_KEY, viewLifecycleOwner
        ) { _, bundle ->
            val name = bundle.getString(GoogleAccountChooserDialog.RESULT_NAME).orEmpty()
            val parts = name.split(" ", limit = 2)
            onboardingViewModel.setGoogleAccount(
                email = bundle.getString(GoogleAccountChooserDialog.RESULT_EMAIL).orEmpty(),
                first = parts.getOrElse(0) { "" },
                last = parts.getOrElse(1) { "" },
            )
            findNavController().navigate(R.id.action_signIn_to_phoneNumber)
        }

        view.findViewById<View>(R.id.btnGoogle).setOnClickListener {
            GoogleAccountChooserDialog().show(childFragmentManager, "google_chooser")
        }

        view.findViewById<View>(R.id.btnEmail).setOnClickListener {
            findNavController().navigate(R.id.action_signIn_to_emailSignUp)
        }

        view.findViewById<View>(R.id.btnPhone).setOnClickListener {
            onboardingViewModel.usePhoneOnly()
            findNavController().navigate(R.id.action_signIn_to_phoneNumber)
        }

        view.findViewById<View>(R.id.linkSignIn).setOnClickListener {
            findNavController().navigate(R.id.action_signIn_to_signInExisting)
        }
    }
}
