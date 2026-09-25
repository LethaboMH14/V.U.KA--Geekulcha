package za.co.vuka.app.ui.guardian

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
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
import za.co.vuka.app.ui.onboarding.OnboardingViewModel

class EnrolViewModel : ViewModel() {
    var stage = EnrolFragment.Stage.CODE
    var alertsAsked = false
    var scanMethod = false
    var code = ""
}

/**
 * Guardian enrolment (Enrol.tsx): enter or scan the 6-digit invite code, then
 * give explicit consent to what is recorded. When the consent screen opens and
 * notifications aren't allowed yet, a "Turn on alerts?" pop-up explains why
 * before Android's own prompt.
 *
 * SIMULATED: there is no invite backend, so any complete code continues and
 * the scanner is a placeholder that opens no camera. The prototype's
 * wrong/expired/locked states aren't built, because nothing could trigger them.
 */
class EnrolFragment : Fragment(R.layout.fragment_guardian_enrol) {

    enum class Stage { CODE, CONSENT }

    private val vm: EnrolViewModel by viewModels()
    private val onboardingViewModel: OnboardingViewModel by activityViewModels()
    private lateinit var boxes: List<TextView>

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

        boxes = view.findViewById<ViewGroup>(R.id.codeBoxes).children.map { it as TextView }.toList()

        view.findViewById<ViewGroup>(R.id.keypad).children
            .filterIsInstance<TextView>()
            .forEach { key -> key.setOnClickListener { onDigit(key.text.toString()) } }

        view.findViewById<View>(R.id.keyDelete).setOnClickListener {
            vm.code = vm.code.dropLast(1)
            render()
        }

        view.findViewById<View>(R.id.tabCode).setOnClickListener { vm.scanMethod = false; render() }
        view.findViewById<View>(R.id.tabScan).setOnClickListener { vm.scanMethod = true; render() }

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
        onboardingViewModel.enrolAsGuardian()
        findNavController().navigate(
            if (onboardingViewModel.memberSignedIn) R.id.action_guardianEnrol_to_standbyKeepMember
            else R.id.action_guardianEnrol_to_standby
        )
    }

    private fun onDigit(digit: String) {
        if (vm.code.length >= CODE_LENGTH) return
        vm.code += digit
        render()
        if (vm.code.length == CODE_LENGTH) {
            // SIMULATED: replace with the real invite-code check.
            vm.code = ""
            goTo(Stage.CONSENT)
            askForAlertsIfNeeded()
        }
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

        view.findViewById<View>(R.id.tabCode).setBackgroundResource(
            if (vm.scanMethod) R.drawable.bg_tab_inactive else R.drawable.bg_input_field_error
        )
        view.findViewById<View>(R.id.tabScan).setBackgroundResource(
            if (vm.scanMethod) R.drawable.bg_input_field_error else R.drawable.bg_tab_inactive
        )
        view.findViewById<View>(R.id.methodCode).visibility = if (vm.scanMethod) View.GONE else View.VISIBLE
        view.findViewById<View>(R.id.methodScan).visibility = if (vm.scanMethod) View.VISIBLE else View.GONE

        boxes.forEachIndexed { i, box ->
            val digit = vm.code.getOrNull(i)
            box.text = digit?.toString().orEmpty()
            box.setBackgroundResource(
                if (digit != null) R.drawable.bg_input_field_error else R.drawable.bg_input_field
            )
        }
        view.findViewById<View>(R.id.codeBoxes).contentDescription =
            "Invite code, ${vm.code.length} of $CODE_LENGTH digits entered"

        val understood = view.findViewById<CheckBox>(R.id.cbUnderstood).isChecked
        view.findViewById<View>(R.id.btnUnderstand).apply {
            isEnabled = understood
            alpha = if (understood) 1f else 0.4f
        }
    }

    companion object {
        private const val CODE_LENGTH = 6
    }
}
