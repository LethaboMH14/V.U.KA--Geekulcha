package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import za.co.vuka.app.api.ServerSync
import android.content.Intent
import android.view.View
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.fragment.app.activityViewModels
import za.co.vuka.app.R
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

/**
 * Guardian invite (InviteGuardians.tsx's sheet): asks the ANCHOR server for a
 * one-time code (POST /v1/guardians/invites, after the PIN's add_guardian
 * authorisation) and shows it with a Share button. A duress PIN gets a
 * decoy code that looks the same.
 */
class InviteGuardianSheet : BottomSheetDialogFragment(R.layout.dialog_invite_guardian) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()
    private var code: String? = null

    override fun getTheme() = R.style.ThemeOverlay_Vuka_BottomSheet

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<View>(R.id.btnClose).setOnClickListener { dismiss() }

        val firstName = onboardingViewModel.firstName.value
        val done = view.findViewById<TextView>(R.id.btnDone)
        done.text = if (firstName.isBlank()) "Done — I sent the invite" else "Done — $firstName sent the invite"
        done.isEnabled = false
        done.alpha = 0.4f
        done.setOnClickListener {
            parentFragmentManager.setFragmentResult(RESULT_KEY, bundleOf())
            dismiss()
        }
        view.findViewById<View>(R.id.btnShare).setOnClickListener {
            val c = code ?: return@setOnClickListener
            startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, "Join me on VUKA as my guardian. Open VUKA, tap I'm a guardian and enter this code: $c (valid for 10 minutes).")
            }, "Share invite code"))
        }

        code = savedInstanceState?.getString(KEY_CODE)
        if (code != null) return show(view, code!!)
        // The PIN was just entered: the invite carries its authorisation (duress gets a decoy, same look).
        ServerSync.inviteGuardian(requireContext(), requireArguments().getBoolean(ARG_DURESS)) { result ->
            val v = this.view ?: return@inviteGuardian
            result.onSuccess { code = it; show(v, it) }
                .onFailure {
                    v.findViewById<TextView>(R.id.tvInviteState).text =
                        "Couldn't get a code: ${it.message}. Close this and try again when you're online."
                }
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        code?.let { outState.putString(KEY_CODE, it) }
    }

    private fun show(view: View, c: String) {
        view.findViewById<TextView>(R.id.tvCode).apply {
            text = c
            contentDescription = "Invite code " + c.toCharArray().joinToString(" ")
        }
        view.findViewById<TextView>(R.id.tvInviteState).text = "From VUKA's server · one-time code"
        view.findViewById<View>(R.id.btnShare).isEnabled = true
        view.findViewById<View>(R.id.btnDone).apply { isEnabled = true; alpha = 1f }
    }

    companion object {
        const val RESULT_KEY = "guardian_invite_sent"
        private const val ARG_DURESS = "duress"
        private const val KEY_CODE = "code"

        fun newInstance(duress: Boolean) = InviteGuardianSheet().apply { arguments = bundleOf(ARG_DURESS to duress) }
    }
}
