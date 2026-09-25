package za.co.vuka.app.ui.settings

import android.os.Bundle
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
import za.co.vuka.app.auth.PinGateSheet
import za.co.vuka.app.auth.PinResult
import za.co.vuka.app.ui.home.JourneyViewModel
import za.co.vuka.app.ui.onboarding.InviteGuardianSheet
import za.co.vuka.app.ui.onboarding.OnboardingViewModel
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

/**
 * Settings (Settings.tsx), grouped as Profile, Guardians, Appearance,
 * Documents and your rights, Privacy and data, and Account.
 *
 * Inviting a guardian and signing out need the PIN ([PinGateSheet]).
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
        PinGateSheet.listen(this, "guardian_add") {
            InviteGuardianSheet().show(childFragmentManager, "invite_guardian")
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
                combine(
                    onboardingViewModel.firstName,
                    onboardingViewModel.surname,
                    onboardingViewModel.phoneNumber,
                ) { first, last, phone -> Triple(first, last, phone) }
                    .collect { (first, last, phone) -> bindProfile(view, "$first $last".trim(), phone) }
            }
        }
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                onboardingViewModel.pendingInvites.collect { bindGuardians(view, it) }
            }
        }
    }

    private fun bindProfile(view: View, name: String, phone: String) {
        val rows = view.findViewById<ViewGroup>(R.id.profileRows)
        rows.removeAllViews()
        rows.addView(row(rows, R.drawable.ic_user, "Name", name.ifBlank { "Not set" }, trailing = "Edit") {
            EditNameSheet().show(childFragmentManager, "edit_name")
        })
        rows.addView(
            row(
                rows, R.drawable.ic_phone, "Phone number",
                // Changing it means a new SMS code, and SMS isn't connected yet.
                "${phone.ifBlank { "Not set" }} · can't be changed yet"
            )
        )
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
        rows.addView(row(rows, R.drawable.ic_key, "Recovery", "Recovery codes aren't available in this build yet."))
        // Deletion is a 72-hour server-side schedule (spec §9); there's no server to schedule it on yet.
        rows.addView(
            row(rows, R.drawable.ic_trash, "Delete my data", "Needs the ANCHOR server, which isn't connected yet.")
        )
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

/** Edit the name guardians see, with YourName's validation. */
class EditNameSheet : BottomSheetDialogFragment(R.layout.dialog_edit_name) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun getTheme() = R.style.ThemeOverlay_Vuka_BottomSheet

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val etFirst = view.findViewById<EditText>(R.id.etFirstName)
        val etLast = view.findViewById<EditText>(R.id.etSurname)
        if (savedInstanceState == null) {
            etFirst.setText(onboardingViewModel.firstName.value)
            etLast.setText(onboardingViewModel.surname.value)
        }

        view.findViewById<View>(R.id.btnClose).setOnClickListener { dismiss() }
        view.findViewById<View>(R.id.btnSave).setOnClickListener {
            val first = etFirst.text.toString().trim()
            val last = etLast.text.toString().trim()
            if (first.isEmpty() || last.isEmpty()) {
                view.findViewById<View>(R.id.errorContainer).visibility = View.VISIBLE
                return@setOnClickListener
            }
            onboardingViewModel.setName(first, last)
            dismiss()
        }
    }
}
