package za.co.vuka.app.ui.settings

import android.os.Bundle
import android.util.Patterns
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.annotation.DrawableRes
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.ui.onboarding.VerifyContactDialog
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import za.co.vuka.app.api.ServerSync
import za.co.vuka.app.auth.AccountStore
import za.co.vuka.app.auth.PinGateSheet
import za.co.vuka.app.auth.PinResult
import za.co.vuka.app.ui.home.JourneyViewModel
import za.co.vuka.app.ui.onboarding.InviteGuardianSheet
import za.co.vuka.app.ui.onboarding.OnboardingViewModel
import za.co.vuka.app.ui.onboarding.saMobilePattern
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

/**
 * Settings (Settings.tsx), grouped as Profile, Guardians, Appearance,
 * Documents and your rights, Privacy and data, and Account.
 *
 * Editing the profile, inviting a guardian and signing out need the PIN
 * ([PinGateSheet]).
 * Guardian removal, deletion and recovery need the server and aren't offered
 * yet. Their rows say why.
 */
class SettingsFragment : Fragment(R.layout.fragment_settings) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()
    private val journey: JourneyViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        childFragmentManager.setFragmentResultListener(
            InviteGuardianSheet.RESULT_KEY, viewLifecycleOwner
        ) { _, _ -> onboardingViewModel.addPendingInvite() }

        // Both look identical on screen. Server-side, a duress invite is a decoy (spec G1).
        PinGateSheet.listen(this, "guardian_add") { mode ->
            InviteGuardianSheet.newInstance(duress = mode == PinResult.DURESS).show(childFragmentManager, "invite_guardian")
        }

        // A duress sign-out looks the same and raises the alarm (DuressSignals).
        // Only a normal PIN ends a running journey; under duress it keeps going unseen.
        // Deleting data under duress is a hard no-op dressed as success (PIN-AUTHORITY-RULES §3):
        // a duress PIN only signs out, so the screen looks the same and nothing is wiped.
        PinGateSheet.listen(this, "delete_profile") { mode ->
            if (mode == PinResult.NORMAL) {
                journey.reset()
                onboardingViewModel.deleteProfile()
            } else {
                onboardingViewModel.signOut()
            }
            findNavController().navigate(R.id.action_settings_to_welcome)
            if (mode == PinResult.NORMAL) ThemePrefs.reset(requireActivity())
        }

        // Contact details decide who can reach the member, so editing them needs the PIN.
        // A duress PIN opens the same editor, so the screen gives nothing away.
        PinGateSheet.listen(this, "profile_edit") {
            EditProfileSheet().show(childFragmentManager, "edit_profile")
        }
        view.findViewById<View>(R.id.profileHeader).setOnClickListener {
            PinGateSheet.open(this, "profile_edit")
        }

        PinGateSheet.listen(this, "sign_out") { mode ->
            if (mode == PinResult.NORMAL) journey.end()
            onboardingViewModel.signOut()
            findNavController().navigate(R.id.action_settings_to_welcome)
        }

        bindGuardianRole(view)
        bindTheme(view)
        bindDocuments(view)
        bindData(view)
        bindAccount(view)

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                combine(onboardingViewModel.firstName, onboardingViewModel.surname) { first, last -> first to last }
                    .collect { (first, last) -> bindProfile(view, first, last) }
            }
        }
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                onboardingViewModel.pendingInvites.collect { bindGuardians(view, it) }
            }
        }
        ServerSync.init(requireContext())
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                ServerSync.status.collect { bindServer(view, it) }
            }
        }
    }

    private fun bindProfile(view: View, first: String, last: String) {
        val name = "$first $last".trim()
        val initials = listOf(first, last).mapNotNull { it.firstOrNull()?.uppercaseChar() }.joinToString("")
        view.findViewById<TextView>(R.id.tvAvatar).apply {
            text = initials
            visibility = if (initials.isEmpty()) View.GONE else View.VISIBLE
        }
        view.findViewById<View>(R.id.ivAvatar).visibility = if (initials.isEmpty()) View.VISIBLE else View.GONE
        view.findViewById<TextView>(R.id.tvProfileName).text = name.ifBlank { "Your profile" }
        view.findViewById<View>(R.id.profileHeader).contentDescription =
            "${name.ifBlank { "Your profile" }}. Edit your details, needs your PIN"
    }

    private fun bindGuardians(view: View, pending: Int) {
        val rows = view.findViewById<ViewGroup>(R.id.guardianRows)
        rows.removeAllViews()
        if (pending == 0) {
            rows.addView(row(rows, R.drawable.ic_users, "No guardians yet", null))
        }
        repeat(pending) { i ->
            rows.addView(row(rows, R.drawable.ic_shield_chevron, "Invite ${i + 1}", "Pending · simulated invite"))
        }
        rows.addView(row(rows, R.drawable.ic_users, "Invite a guardian", "Needs your PIN", chevron = true) {
            PinGateSheet.open(this, "guardian_add")
        })
    }

    // One person can be both protected and a guardian (spec G1: guardian mode, same APK).
    private fun bindGuardianRole(view: View) {
        val rows = view.findViewById<ViewGroup>(R.id.guardianRoleRows)
        rows.addView(
            if (onboardingViewModel.guardianEnrolled) {
                row(rows, R.drawable.ic_shield_chevron, "Guardian standby", "You're a guardian for someone", chevron = true) {
                    findNavController().navigate(R.id.action_settings_to_standby)
                }
            } else {
                row(rows, R.drawable.ic_users, "Protect someone", "Join as their guardian with an invite code", chevron = true) {
                    findNavController().navigate(R.id.action_settings_to_guardianEnrol)
                }
            }
        )
    }

    private fun bindTheme(view: View) {
        val options = mapOf(
            R.id.themeIvory to ThemePrefs.Theme.IVORY,
            R.id.themeSilver to ThemePrefs.Theme.SILVER,
            R.id.themeMidnight to ThemePrefs.Theme.MIDNIGHT,
            R.id.themeSystem to ThemePrefs.Theme.SYSTEM,
        )
        val current = ThemePrefs.get(requireContext())
        options.forEach { (id, theme) ->
            view.findViewById<TextView>(id).apply {
                val selected = theme == current
                setBackgroundResource(if (selected) R.drawable.bg_input_field_error else R.drawable.bg_tab_inactive)
                isSelected = selected
                contentDescription = "${theme.label} theme" + if (selected) ", selected" else ""
                // Changing night mode recreates the activity; the tab and shared state survive it.
                setOnClickListener { if (!selected) ThemePrefs.set(requireActivity(), theme) }
            }
        }
    }

    private fun bindDocuments(view: View) {
        val rows = view.findViewById<ViewGroup>(R.id.documentRows)
        listOf(
            Triple(R.drawable.ic_file_text, "Terms and conditions", R.raw.doc_terms),
            Triple(R.drawable.ic_file_text, "Privacy notice", R.raw.doc_privacy),
            Triple(R.drawable.ic_scales, "Your rights", R.raw.doc_rights),
            Triple(R.drawable.ic_info, "About the record", R.raw.doc_record),
        ).forEach { (icon, title, raw) ->
            rows.addView(row(rows, icon, title, null, chevron = true) {
                findNavController().navigate(
                    R.id.action_settings_to_document, DocumentFragment.args(title, raw)
                )
            })
        }
    }

    private fun bindData(view: View) {
        val rows = view.findViewById<ViewGroup>(R.id.dataRows)
        // Where password-reset codes go. The PIN is recovery-code only (spec §9); the screen says so.
        val channel = AccountStore(requireContext()).recoveryChannel
        rows.addView(
            row(
                rows, R.drawable.ic_key, "Recovery",
                when (channel) {
                    AccountStore.RecoveryChannel.EMAIL -> "Password resets go to your email"
                    AccountStore.RecoveryChannel.PHONE -> "Password resets go to your mobile number"
                    null -> "Choose where password resets go"
                },
                chevron = true,
            ) { findNavController().navigate(R.id.action_settings_to_recovery) }
        )
        // Server-side deletion (spec §9's 72-hour schedule) belongs with "Delete profile"
        // under Account once the ANCHOR server exists; there's no separate row for it.
    }

    private fun bindServer(view: View, s: ServerSync.Status) {
        val rows = view.findViewById<ViewGroup>(R.id.serverRows)
        rows.removeAllViews()
        val which = when (s.serverUrl) {
            ServerSync.CLOUD_URL -> "VUKA cloud (Azure)"
            ServerSync.EMULATOR_HOST_URL -> "This computer (development)"
            else -> "Custom"
        }
        rows.addView(row(rows, R.drawable.ic_gear, "Server", "$which\n${s.serverUrl}", chevron = true) { chooseServer() })
        rows.addView(row(rows, R.drawable.ic_key, "This phone's account", s.subjectId ?: "Not registered yet"))
        val delivery = when {
            s.waiting > 0 && s.lastError != null -> "${s.sent} received · ${s.waiting} waiting (${s.lastError})"
            s.waiting > 0 -> "${s.sent} received · ${s.waiting} sending…"
            else -> "${s.sent} signed events received" + if (s.refused > 0) " · ${s.refused} refused" else ""
        }
        rows.addView(row(rows, R.drawable.ic_file_text, "Delivery", delivery))
        rows.addView(row(rows, R.drawable.ic_check_circle, "Test connection", "Calls the server now and shows its answer", chevron = true) {
            ServerSync.testConnection(requireContext()) { result ->
                if (!isAdded) return@testConnection
                MaterialAlertDialogBuilder(requireContext())
                    .setTitle(if (result.isSuccess) "Connected" else "Not connected")
                    .setMessage(result.getOrElse { "Couldn't reach ${ServerSync.serverUrl}: ${it.message}" })
                    .setPositiveButton("OK", null)
                    .show()
            }
        })
    }

    // Each server has its own database: switching registers this phone again there.
    private fun chooseServer() {
        val options = arrayOf("VUKA cloud (Azure)", "This computer (development, via adb reverse)", "Custom address…")
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Choose a server")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> ServerSync.setServer(requireContext(), ServerSync.CLOUD_URL)
                    1 -> ServerSync.setServer(requireContext(), ServerSync.EMULATOR_HOST_URL)
                    else -> {
                        val input = EditText(requireContext()).apply { setText(ServerSync.serverUrl); setSingleLine() }
                        MaterialAlertDialogBuilder(requireContext())
                            .setTitle("Server address")
                            .setView(input)
                            .setPositiveButton("Use it") { _, _ -> ServerSync.setServer(requireContext(), input.text.toString()) }
                            .setNegativeButton("Cancel", null)
                            .show()
                    }
                }
            }
            .show()
    }

    private fun bindAccount(view: View) {
        val rows = view.findViewById<ViewGroup>(R.id.accountRows)
        rows.addView(
            row(rows, R.drawable.ic_sign_out, "Sign out of this phone", "Needs your PIN", chevron = true) {
                PinGateSheet.open(this, "sign_out")
            }
        )
        // For testing the flows: after this, the app starts again at Welcome.
        rows.addView(
            row(
                rows, R.drawable.ic_trash, "Delete profile from this phone",
                "Removes your profile, PINs, record and theme from this phone. Needs your PIN.", chevron = true
            ) {
                PinGateSheet.open(this, "delete_profile")
            }
        )
    }

    private fun row(
        parent: ViewGroup,
        @DrawableRes icon: Int,
        label: String,
        sublabel: String?,
        trailing: String? = null,
        chevron: Boolean = false,
        onClick: (() -> Unit)? = null,
    ): View = layoutInflater.inflate(R.layout.item_settings_row, parent, false).apply {
        findViewById<ImageView>(R.id.ivIcon).setImageResource(icon)
        findViewById<TextView>(R.id.tvLabel).text = label
        findViewById<TextView>(R.id.tvSublabel).apply {
            text = sublabel
            visibility = if (sublabel != null) View.VISIBLE else View.GONE
        }
        findViewById<TextView>(R.id.tvTrailing).apply {
            text = trailing
            visibility = if (trailing != null) View.VISIBLE else View.GONE
        }
        findViewById<View>(R.id.ivChevron).visibility = if (chevron) View.VISIBLE else View.GONE
        if (onClick != null) {
            val ripple = TypedValue()
            context.theme.resolveAttribute(android.R.attr.selectableItemBackground, ripple, true)
            setBackgroundResource(ripple.resourceId)
            setOnClickListener { onClick() }
        }
    }
}

/**
 * Edit profile: name, surname, mobile number and email, with the sign-up
 * forms' validation. At least one way to reach the member must remain.
 * SIMULATED verification: a changed number or email is saved without a code,
 * because no SMS or email service is connected. The sheet says so.
 */
class EditProfileSheet : BottomSheetDialogFragment(R.layout.dialog_edit_profile) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun getTheme() = R.style.ThemeOverlay_Vuka_BottomSheet

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val etFirst = view.findViewById<EditText>(R.id.etFirstName)
        val etLast = view.findViewById<EditText>(R.id.etSurname)
        val etPhone = view.findViewById<EditText>(R.id.etPhone)
        val etEmail = view.findViewById<EditText>(R.id.etEmail)
        if (savedInstanceState == null) {
            etFirst.setText(onboardingViewModel.firstName.value)
            etLast.setText(onboardingViewModel.surname.value)
            etPhone.setText(onboardingViewModel.phoneNumber.value.removePrefix("+27"))
            etEmail.setText(onboardingViewModel.email.value)
        }
        (dialog as? BottomSheetDialog)?.behavior?.apply {
            state = BottomSheetBehavior.STATE_EXPANDED
            skipCollapsed = true
        }

        view.findViewById<View>(R.id.btnClose).setOnClickListener { dismiss() }
        view.findViewById<View>(R.id.btnSave).setOnClickListener {
            val first = etFirst.text.toString().trim()
            val last = etLast.text.toString().trim()
            val digits = etPhone.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val error = when {
                first.isEmpty() || last.isEmpty() -> "Enter both your first name and surname."
                digits.isNotEmpty() && !saMobilePattern.matches(digits) ->
                    "Enter a valid South African mobile number — 9 digits, not starting with 0."
                email.isNotEmpty() && !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Enter a valid email address."
                digits.isEmpty() && email.isEmpty() -> "Keep a mobile number or an email, so we can reach you."
                else -> null
            }
            if (error != null) {
                view.findViewById<TextView>(R.id.tvError).text = error
                view.findViewById<View>(R.id.errorContainer).visibility = View.VISIBLE
                return@setOnClickListener
            }
            val oldEmail = onboardingViewModel.email.value
            val oldPhone = onboardingViewModel.phoneNumber.value
            val phone = if (digits.isEmpty()) "" else "+27$digits"
            onboardingViewModel.updateProfile(first, last, phone, email)
            // A new email or number is verified with a real code before it counts on the server.
            val activity = requireActivity()
            val newEmail = email.isNotBlank() && !email.equals(oldEmail, ignoreCase = true)
            val newPhone = phone.isNotBlank() && phone != oldPhone
            dismiss()
            when {
                newEmail && newPhone -> VerifyContactDialog.show(activity, "email", email) { VerifyContactDialog.show(activity, "sms", phone) }
                newEmail -> VerifyContactDialog.show(activity, "email", email)
                newPhone -> VerifyContactDialog.show(activity, "sms", phone)
            }
        }
    }
}
