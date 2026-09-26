package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.widget.EditText
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.auth.AccountStore
import za.co.vuka.app.auth.InterimPasswordStore
import com.google.android.material.dialog.MaterialAlertDialogBuilder

/**
 * Returning member: sign in with Google (then PIN), by phone number (code,
 * then PIN) or by the email and password they registered (then PIN). Either way the last step
 * is the PIN on "Welcome back", so a duress PIN works at sign-in too.
 *
 * LOCAL ONLY: only an account registered on this phone can be found.
 */
class SignInExistingFragment : Fragment(R.layout.fragment_sign_in_existing) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val etEmail = view.findViewById<EditText>(R.id.etEmail)
        val etPassword = view.findViewById<EditText>(R.id.etPassword)
        val error = view.findViewById<View>(R.id.errorContainer)

        view.findViewById<View>(R.id.btnBack).setOnClickListener { findNavController().navigateUp() }
        view.findViewById<View>(R.id.linkCreate).setOnClickListener { findNavController().navigateUp() }
        bindPasswordToggle(view.findViewById(R.id.btnTogglePassword), etPassword)

        // SIMULATED chooser, as at sign-up. The chosen Google address must match the
        // account's email on this phone; the PIN on "Welcome back" is still required.
        childFragmentManager.setFragmentResultListener(
            GoogleAccountChooserDialog.RESULT_KEY, viewLifecycleOwner
        ) { _, bundle ->
            val chosen = bundle.getString(GoogleAccountChooserDialog.RESULT_EMAIL).orEmpty()
            val saved = AccountStore(requireContext()).profile()?.email.orEmpty()
            if (chosen.isNotBlank() && chosen.equals(saved, ignoreCase = true)) {
                findNavController().navigate(R.id.action_signInExisting_to_welcomeBack)
            } else {
                MaterialAlertDialogBuilder(requireContext())
                    .setTitle("No account found")
                    .setMessage("There's no VUKA account for $chosen on this phone.")
                    .setPositiveButton("Create an account") { _, _ -> findNavController().navigateUp() }
                    .setNegativeButton("Cancel", null)
                    .show()
            }
        }
        view.findViewById<View>(R.id.btnGoogle).setOnClickListener {
            GoogleAccountChooserDialog().show(childFragmentManager, "google_chooser")
        }

        view.findViewById<View>(R.id.linkForgot).setOnClickListener {
            ForgotPasswordSheet.newInstance(etEmail.text.toString().trim()).show(childFragmentManager, "forgot_password")
        }
        childFragmentManager.setFragmentResultListener(ForgotPasswordSheet.RESULT_KEY, viewLifecycleOwner) { _, _ ->
            error.visibility = View.GONE
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Password changed")
                .setMessage("Sign in with your new password. You'll still need your PIN.")
                .setPositiveButton("OK", null)
                .show()
        }

        view.findViewById<View>(R.id.btnPhone).setOnClickListener {
            onboardingViewModel.usePhoneOnly()
            onboardingViewModel.signingIn = true
            findNavController().navigate(R.id.action_signInExisting_to_phoneNumber)
        }

        view.findViewById<View>(R.id.btnSignIn).setOnClickListener {
            // A password is saved at sign-up, before onboarding finishes, so also require
            // the completed profile that "Welcome back" signs into.
            val ok = InterimPasswordStore(requireContext())
                .verify(etEmail.text.toString(), etPassword.text.toString()) &&
                AccountStore(requireContext()).profile() != null
            etPassword.text.clear()
            // One message for any mismatch, so it never reveals which part was wrong.
            error.visibility = if (ok) View.GONE else View.VISIBLE
            if (ok) findNavController().navigate(R.id.action_signInExisting_to_welcomeBack)
        }
    }
}
