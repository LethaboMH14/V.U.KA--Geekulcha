package za.co.vuka.app.ui.guardian

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.TypedValue
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.annotation.DrawableRes
import androidx.core.app.NotificationManagerCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.ui.onboarding.OnboardingViewModel
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

/**
 * Guardian standby (Standby.tsx). The prototype shows a linked member, alerts
 * "On" and a past test alert. None of those exist without the invite and
 * alert backends, so this screen says so instead.
 *
 * One person can be both a member and a guardian. With a member account on
 * this phone, Standby opens from their Home card or Settings and has a back
 * button. Without one, it offers "Set up VUKA for yourself".
 */
class StandbyFragment : Fragment(R.layout.fragment_guardian_standby) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val isMember = onboardingViewModel.memberSignedIn

        // Stepping down only ends the guardian role: a member goes back to their own
        // Home, and a guardian-only phone goes back to the start screen.
        childFragmentManager.setFragmentResultListener(
            LeaveGuardianSheet.RESULT_KEY, viewLifecycleOwner
        ) { _, _ ->
            findNavController().navigate(if (isMember) R.id.action_standby_to_home else R.id.action_standby_to_welcome)
        }

        // A member opened Standby from their Home or Settings: Back returns there.
        view.findViewById<View>(R.id.btnBack).apply {
            visibility = if (isMember) View.VISIBLE else View.GONE
            setOnClickListener { findNavController().navigateUp() }
        }

        if (!isMember) {
            bindRow(
                view.findViewById(R.id.rowSetUpForYourself), R.drawable.ic_shield_chevron,
                "Set up VUKA for yourself", "Be protected too. You stay their guardian."
            ) { findNavController().navigate(R.id.action_standby_to_signIn) }
        }

        bindRow(
            view.findViewById(R.id.rowStopGuardian), R.drawable.ic_user,
            "Stop being a guardian", "You won't get their alerts any more"
        ) { LeaveGuardianSheet().show(childFragmentManager, "leave_guardian") }

        // SIMULATED delivery: raises the notification and the app-wide banner,
        // exactly as a real FCM alert will (spec G3).
        view.findViewById<View>(R.id.btnTurnOnNotifications).setOnClickListener {
            val pkg = requireContext().packageName
            startActivity(
                // The notification page exists from Android 8; before that, the app's settings page.
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, pkg)
                } else {
                    Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", pkg, null))
                }
            )
        }

        view.findViewById<View>(R.id.linkPreview).setOnClickListener {
            GuardianAlerts.simulateIncoming(requireContext())
            findNavController().navigate(R.id.action_standby_to_alert)
        }
    }

    // Re-checked on every return, e.g. from the system notification settings.
    override fun onResume() {
        super.onResume()
        view?.findViewById<View>(R.id.notificationsOff)?.visibility =
            if (NotificationManagerCompat.from(requireContext()).areNotificationsEnabled()) View.GONE else View.VISIBLE
    }

    private fun bindRow(row: View, @DrawableRes icon: Int, label: String, sublabel: String, onClick: () -> Unit) {
        row.visibility = View.VISIBLE
        row.findViewById<ImageView>(R.id.ivIcon).setImageResource(icon)
        row.findViewById<TextView>(R.id.tvLabel).text = label
        row.findViewById<TextView>(R.id.tvSublabel).apply {
            text = sublabel
            visibility = View.VISIBLE
        }
        row.findViewById<View>(R.id.ivChevron).visibility = View.VISIBLE
        val ripple = TypedValue()
        row.context.theme.resolveAttribute(android.R.attr.selectableItemBackground, ripple, true)
        row.setBackgroundResource(ripple.resourceId)
        row.setOnClickListener { onClick() }
    }
}

/** "Stop being a guardian?" confirmation, with opposite choices rather than Leave/Cancel. */
class LeaveGuardianSheet : BottomSheetDialogFragment(R.layout.dialog_leave_guardian) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun getTheme() = R.style.ThemeOverlay_Vuka_BottomSheet

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<TextView>(R.id.tvBody).text = if (onboardingViewModel.memberSignedIn) {
            "You'll stop getting alerts from the person you protect. Your own VUKA account and " +
                "guardians aren't affected. To be their guardian again, they'll need to send you a new invite."
        } else {
            "You'll stop getting alerts from the person you protect, and this phone goes back to the " +
                "start screen. To be their guardian again, they'll need to send you a new invite."
        }

        view.findViewById<View>(R.id.btnClose).setOnClickListener { dismiss() }
        view.findViewById<View>(R.id.btnCancel).setOnClickListener { dismiss() }
        view.findViewById<View>(R.id.btnConfirmLeave).setOnClickListener {
            onboardingViewModel.leaveAsGuardian()
            parentFragmentManager.setFragmentResult(RESULT_KEY, Bundle())
            dismiss()
        }
    }

    companion object {
        const val RESULT_KEY = "guardian_left"
    }
}
