package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import androidx.core.os.bundleOf
import za.co.vuka.app.R
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

/**
 * SIMULATED Google account chooser — lists one fixed account, matching
 * BottomSheet.tsx's "Choose an account" sheet. Not wired to a real
 * identity provider.
 */
class GoogleAccountChooserDialog : BottomSheetDialogFragment(R.layout.dialog_google_account_choose) {

    override fun getTheme() = R.style.ThemeOverlay_Vuka_BottomSheet

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<View>(R.id.btnCloseChooser).setOnClickListener { dismiss() }

        view.findViewById<View>(R.id.rowAccount).setOnClickListener {
            parentFragmentManager.setFragmentResult(
                RESULT_KEY,
                bundleOf(RESULT_NAME to "Thandi Dlamini", RESULT_EMAIL to "thandi.dlamini@example.co.za")
            )
            dismiss()
        }
    }

    companion object {
        const val RESULT_KEY = "google_account_chosen"
        const val RESULT_NAME = "name"
        const val RESULT_EMAIL = "email"
    }
}