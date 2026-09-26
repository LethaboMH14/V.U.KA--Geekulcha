package za.co.vuka.app.ui.guardian

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.EditText
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.view.children
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.navigation.fragment.findNavController
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import za.co.vuka.app.R
import za.co.vuka.app.api.EventClient
import za.co.vuka.app.api.ServerSync
import za.co.vuka.app.ui.onboarding.OnboardingViewModel

class EnrolViewModel : ViewModel() {
    var stage = EnrolFragment.Stage.CODE
    var alertsAsked = false
    var code = ""
    var joining = false
}

/**
 * Guardian enrolment (Enrol.tsx): enter the invite code the member shared,
 * then give explicit consent to what is recorded (POPIA s18). Only after
 * consent is the code sent to the server (POST /v1/guardians/accept, signed
 * with this phone's own key). A wrong, expired or used code comes back as one
 * refusal, and the member is asked for a new code.
 */
class EnrolFragment : Fragment(R.layout.fragment_guardian_enrol) {

    enum class Stage { CODE, CONSENT }

    private val vm: EnrolViewModel by viewModels()
    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    // The answer doesn't change the flow: Standby shows how to turn notifications on later.
    private val requestNotifications = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    // Back steps through the stages before leaving enrolment.
    private val backOneStage = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() = stepBack()
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner, backOneStage)

        val codeField = view.findViewById<EditText>(R.id.etInviteCode)
        if (savedInstanceState == null) codeField.setText(vm.code)
        view.findViewById<View>(R.id.btnCodeContinue).setOnClickListener {
            val code = codeField.text.toString().trim().lowercase()
            if (!CODE_PATTERN.matches(code)) {
                showCodeError("Check the code: 8 letters or numbers, a dash, then 6 digits.")
                return@setOnClickListener
            }
            vm.code = code
            view.findViewById<View>(R.id.codeError).visibility = View.GONE
            goTo(Stage.CONSENT)
            askForAlertsIfNeeded()
        }

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            if (vm.stage == Stage.CODE) findNavController().navigateUp() else stepBack()
        }

        val checkbox = view.findViewById<CheckBox>(R.id.cbUnderstood)
        val understand = view.findViewById<View>(R.id.btnUnderstand)
        checkbox.setOnCheckedChangeListener { _, _ -> render() }
        understand.setOnClickListener { finishEnrolment() }

        render()
    }

    /**
     * Alerts reach a guardian as a notification (spec G3). On the consent screen,
     * ask once, with the reason, before Android's prompt. Only when permission is
     * missing: Android never re-asks for one that's already granted.
     */
    private fun askForAlertsIfNeeded() {
        if (vm.alertsAsked || !needsNotificationPermission()) return
        vm.alertsAsked = true
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Turn on alerts?")
            .setView(R.layout.dialog_turn_on_alerts)
            .setPositiveButton("Allow") { _, _ ->
                requestNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
            .setNegativeButton("Not now", null)
            .show()
    }

    private fun needsNotificationPermission() =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED

    private fun finishEnrolment() {
        if (vm.joining) return
        vm.joining = true
        render()
        ServerSync.acceptInvite(requireContext(), vm.code) { result ->
            vm.joining = false
            if (view == null) return@acceptInvite
            result.onSuccess {
                onboardingViewModel.enrolAsGuardian()
                findNavController().navigate(
                    if (onboardingViewModel.memberSignedIn) R.id.action_guardianEnrol_to_standbyKeepMember
                    else R.id.action_guardianEnrol_to_standby
                )
            }.onFailure { e ->
                goTo(Stage.CODE)
                showCodeError(
                    if (e is EventClient.ServerError && e.status in 400..499) {
                        "That code didn't work. It may have expired (10 minutes) or been used. Ask for a new one."
                    } else {
                        "Couldn't reach VUKA's server. Check your connection and try again."
                    }
                )
            }
        }
    }

    private fun showCodeError(message: String) {
        val view = view ?: return
        view.findViewById<TextView>(R.id.tvCodeError).text = message
        view.findViewById<View>(R.id.codeError).visibility = View.VISIBLE
    }

    private fun goTo(stage: Stage) {
        vm.stage = stage
        render()
    }

    private fun stepBack() = goTo(Stage.CODE)

    private fun render() {
        val view = view ?: return
        val stage = vm.stage
        backOneStage.isEnabled = stage != Stage.CODE

        view.findViewById<TextView>(R.id.tvStep).text = "STEP ${stage.ordinal + 1} OF 2"
        view.findViewById<TextView>(R.id.tvTitle).text = when (stage) {
            Stage.CODE -> "Join as a guardian"
            Stage.CONSENT -> "Before you continue"
        }
        view.findViewById<View>(R.id.stageCode).visibility = if (stage == Stage.CODE) View.VISIBLE else View.GONE
        view.findViewById<View>(R.id.stageConsent).visibility = if (stage == Stage.CONSENT) View.VISIBLE else View.GONE

        val understood = view.findViewById<CheckBox>(R.id.cbUnderstood).isChecked
        view.findViewById<TextView>(R.id.btnUnderstand).apply {
            isEnabled = understood && !vm.joining
            alpha = if (understood && !vm.joining) 1f else 0.4f
            text = if (vm.joining) "Joining…" else "I understand"
        }
    }

    companion object {
        /** server/guardians.py: 4 random bytes as hex, a dash, 6 digits. */
        private val CODE_PATTERN = Regex("^[0-9a-f]{8}-[0-9]{6}$")
    }
}
