package za.co.vuka.app.ui.settings

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import za.co.vuka.app.api.ServerSync
import za.co.vuka.app.api.EventClient
import za.co.vuka.app.auth.AccountStore
import za.co.vuka.app.auth.AccountStore.RecoveryChannel
import za.co.vuka.app.auth.InterimPasswordStore

/**
 * Settings → Recovery. Two cards, Email and Mobile number: the member picks
 * where a password-reset code goes, then Continue saves it. Only contacts on
 * the profile can be picked. This covers the email sign-in password only;
 * the PIN is recovered with the recovery code (spec §9, ADR-0036/0041), which
 * isn't in this build, and the screen says so.
 *
 * The choice is saved on VUKA's server, which sends the reset code there.
 */
class RecoveryFragment : Fragment(R.layout.fragment_recovery) {

    private var selected: RecoveryChannel? = null

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val store = AccountStore(requireContext())
        val profile = store.profile()
        val email = profile?.email.orEmpty()
        val phone = profile?.phone.orEmpty()

        selected = savedInstanceState?.getString(KEY_SELECTED)?.let(RecoveryChannel::valueOf) ?: store.recoveryChannel

        view.findViewById<View>(R.id.btnBack).setOnClickListener { findNavController().navigateUp() }
        view.findViewById<TextView>(R.id.tvEmailValue).text = if (email.isBlank()) "Not set · add it in your profile" else maskEmail(email)
        view.findViewById<TextView>(R.id.tvPhoneValue).text = if (phone.isBlank()) "Not set · add it in your profile" else maskPhone(phone)

        bindCard(view, R.id.cardEmail, RecoveryChannel.EMAIL, available = email.isNotBlank())
        bindCard(view, R.id.cardPhone, RecoveryChannel.PHONE, available = phone.isNotBlank())

        // Google and phone sign-ups have no email password, so there's nothing to reset yet.
        if (!InterimPasswordStore(requireContext()).hasPassword()) {
            view.findViewById<TextView>(R.id.tvIntro).text =
                "You don't sign in with an email password, so there's nothing to reset. If you add one later, the code goes to the contact you choose here."
        }

        view.findViewById<View>(R.id.btnContinue).setOnClickListener {
            val choice = selected ?: return@setOnClickListener
            ServerSync.setRecoveryChannel(if (choice == RecoveryChannel.EMAIL) "email" else "sms") { result ->
                if (view == null) return@setRecoveryChannel
                result.onSuccess {
                    store.recoveryChannel = choice
                    findNavController().navigateUp()
                }.onFailure { e ->
                    MaterialAlertDialogBuilder(requireContext())
                        .setTitle("Not saved")
                        .setMessage(
                            if (e is EventClient.ServerError) "${e.reason}. Verify it from Edit profile first."
                            else "Couldn't reach VUKA's server. Try again when you're online."
                        )
                        .setPositiveButton("OK", null)
                        .show()
                }
            }
        }
        render(view)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        selected?.let { outState.putString(KEY_SELECTED, it.name) }
    }

    private fun bindCard(view: View, id: Int, channel: RecoveryChannel, available: Boolean) {
        view.findViewById<View>(id).apply {
            isEnabled = available
            alpha = if (available) 1f else 0.5f
            setOnClickListener {
                selected = channel
                render(view)
            }
        }
    }

    private fun render(view: View) {
        listOf(
            Triple(R.id.cardEmail, R.id.ivEmailCheck, RecoveryChannel.EMAIL),
            Triple(R.id.cardPhone, R.id.ivPhoneCheck, RecoveryChannel.PHONE),
        ).forEach { (card, check, channel) ->
            val on = selected == channel
            view.findViewById<View>(card).apply {
                setBackgroundResource(if (on) R.drawable.bg_input_field_error else R.drawable.bg_tab_inactive)
                isSelected = on
            }
            view.findViewById<View>(check).visibility = if (on) View.VISIBLE else View.INVISIBLE
        }
        view.findViewById<View>(R.id.btnContinue).apply {
            isEnabled = selected != null
            alpha = if (selected != null) 1f else 0.4f
        }
    }

    private companion object {
        const val KEY_SELECTED = "recovery_selected"
    }
}

/** "thandi.dlamini@example.co.za" → "t•••@example.co.za": enough to recognise, not to read out. */
internal fun maskEmail(email: String): String {
    val at = email.indexOf('@')
    return if (at <= 0) email else "${email.first()}•••${email.substring(at)}"
}

/** "+27825550101" → "+27 •• ••• 0101". */
internal fun maskPhone(phone: String): String =
    if (phone.length < 4) phone else "+27 •• ••• ${phone.takeLast(4)}"
