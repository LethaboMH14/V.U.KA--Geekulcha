package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.method.LinkMovementMethod
import android.text.style.ClickableSpan
import android.view.View
import android.widget.CheckBox
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.ui.settings.DocumentFragment

/**
 * Registration, step 2: create an account with Google, with your own email
 * and password, or with just your phone number. The phone route verifies the
 * +27 number; on Google and email it is optional (code by email). Returning
 * members take "Already have an account? Sign in".
 *
 * The Terms and Privacy notice must be accepted first: the three options stay
 * disabled until the box is ticked, and acceptance is written to the record
 * when registration completes.
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

        bindTerms(view)

        view.findViewById<View>(R.id.linkSignIn).setOnClickListener {
            findNavController().navigate(R.id.action_signIn_to_signInExisting)
        }
    }

    // "I agree to the Terms and the Privacy notice", each name opening its document.
    private fun bindTerms(view: View) {
        val text = "I agree to the Terms and the Privacy notice"
        val spans = SpannableString(text)
        fun link(word: String, title: String, raw: Int) {
            val start = text.indexOf(word)
            spans.setSpan(object : ClickableSpan() {
                override fun onClick(widget: View) {
                    findNavController().navigate(R.id.action_signIn_to_document, DocumentFragment.args(title, raw))
                }
            }, start, start + word.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        link("Terms", "Terms and conditions", R.raw.doc_terms)
        link("Privacy notice", "Privacy notice", R.raw.doc_privacy)
        view.findViewById<TextView>(R.id.tvTerms).apply {
            this.text = spans
            movementMethod = LinkMovementMethod.getInstance()
        }

        val box = view.findViewById<CheckBox>(R.id.cbTerms)
        box.isChecked = onboardingViewModel.termsAccepted
        val options = listOf(R.id.btnGoogle, R.id.btnEmail, R.id.btnPhone).map { view.findViewById<View>(it) }
        fun render(agreed: Boolean) = options.forEach {
            it.isEnabled = agreed
            it.alpha = if (agreed) 1f else 0.4f
        }
        render(box.isChecked)
        box.setOnCheckedChangeListener { _, checked ->
            onboardingViewModel.termsAccepted = checked
            render(checked)
        }
    }
}
