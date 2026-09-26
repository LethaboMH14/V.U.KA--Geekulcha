package za.co.vuka.app.ui.onboarding

import android.app.Activity
import android.app.AlertDialog
import android.graphics.Typeface
import android.text.InputFilter
import android.text.InputType
import android.view.View
import android.widget.EditText
import android.widget.TextView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import za.co.vuka.app.R
import za.co.vuka.app.api.EventClient
import za.co.vuka.app.api.ServerSync

/**
 * Verifies an email or +27 number with a real code from VUKA's server: sends
 * it, asks for the 6 digits, and checks them. Used when a contact changes in
 * Edit profile. Wrong / expired / locked answers come from the server.
 */
object VerifyContactDialog {

    fun show(activity: Activity, channel: String, to: String, onVerified: () -> Unit = {}) {
        ServerSync.sendOtp(activity, channel, to, "verify") { result ->
            if (activity.isFinishing) return@sendOtp
            result.onSuccess { sent -> ask(activity, sent, onVerified) }.onFailure { e ->
                MaterialAlertDialogBuilder(activity)
                    .setTitle("Couldn't send a code")
                    .setMessage(
                        if (e is EventClient.ServerError) e.reason
                        else "Couldn't reach VUKA's server. Your change is saved on this phone; verify it later from Edit profile."
                    )
                    .setPositiveButton("OK", null)
                    .show()
            }
        }
    }

    private fun ask(activity: Activity, sent: ServerSync.OtpSent, onVerified: () -> Unit) {
        val container = activity.layoutInflater.inflate(R.layout.dialog_contact_input, null)
        container.findViewById<TextView>(R.id.tvLabel).text = "6-digit code"
        container.findViewById<View>(R.id.tvPrefix).visibility = View.GONE
        val error = container.findViewById<View>(R.id.errorContainer)
        val input = container.findViewById<EditText>(R.id.etValue).apply {
            inputType = InputType.TYPE_CLASS_NUMBER
            typeface = Typeface.MONOSPACE
            filters = arrayOf(InputFilter.LengthFilter(6))
            hint = "123456"
        }
        val note = if (sent.delivery == "dev_log") " (development server: the code is in its console)" else ""
        val dialog = MaterialAlertDialogBuilder(activity)
            .setTitle("Verify it's you")
            .setMessage("Enter the code we sent to ${sent.sentTo}$note.")
            .setView(container)
            .setPositiveButton("Verify", null)
            .setNegativeButton("Later", null)
            .create()
        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val code = input.text.toString()
                if (code.length != 6) return@setOnClickListener
                ServerSync.verifyOtp(sent.otpId, code) { r ->
                    r.onSuccess {
                        dialog.dismiss()
                        onVerified()
                    }.onFailure { e ->
                        container.findViewById<TextView>(R.id.tvError).text = when {
                            e is EventClient.ServerError && e.code == "wrong_code" ->
                                "That code isn't right. ${e.body["attempts_left"]} attempts left."
                            e is EventClient.ServerError -> e.reason
                            else -> "Couldn't reach VUKA's server. Try again."
                        }
                        error.visibility = View.VISIBLE
                    }
                }
            }
        }
        dialog.show()
    }
}
