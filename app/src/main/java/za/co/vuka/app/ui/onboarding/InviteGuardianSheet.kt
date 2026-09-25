package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.fragment.app.activityViewModels
import za.co.vuka.app.R
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

/**
 * SIMULATED guardian invite, matching InviteGuardians.tsx's sheet. It shows a
 * fixed code and a QR block that encodes nothing. No invite is created on any
 * server.
 */
class InviteGuardianSheet : BottomSheetDialogFragment(R.layout.dialog_invite_guardian) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun getTheme() = R.style.ThemeOverlay_Vuka_BottomSheet

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<View>(R.id.btnClose).setOnClickListener { dismiss() }

        val firstName = onboardingViewModel.firstName.value
        view.findViewById<TextView>(R.id.btnDone).text =
            if (firstName.isBlank()) "Done — I sent the invite" else "Done — $firstName sent the invite"

        view.findViewById<View>(R.id.btnDone).setOnClickListener {
            parentFragmentManager.setFragmentResult(RESULT_KEY, bundleOf())
            dismiss()
        }
    }

    companion object {
        const val RESULT_KEY = "guardian_invite_sent"
    }
}
