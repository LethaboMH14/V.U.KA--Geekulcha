package za.co.vuka.app.ui.guardian

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.core.net.toUri
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.ui.guardian.GuardianAlerts.Ack
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.button.MaterialButton

/**
 * Guardian alert (GuardianView.tsx): the one urgent screen, and the only
 * place amber is used.
 *
 * SIMULATED alert, raised by Standby's "Simulate an incoming alert" and opened
 * from its notification or the app-wide banner. The prototype marks it the same
 * way. Its state lives in [GuardianAlerts], so the banner knows when the guardian
 * has stood down.
 * "Call 10111" opens the phone's dialer with 10111 filled in (ACTION_DIAL),
 * the same as the panic screen. Android doesn't let an app place a call to an
 * emergency number itself, so the guardian presses call once more there. The
 * first press is recorded straight away; there is no separate "I called
 * 10111" confirmation. The button stays, so the dialer can be reopened.
 * Stand down is offered from the start too: sometimes the notification is
 * all that's needed (they answer, or the guardian can see they're fine),
 * so the guardian can close it without calling 10111.
 * Responses aren't signed yet, so nothing here claims they are.
 */
class GuardianAlertFragment : Fragment(R.layout.fragment_guardian_alert) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Opens the dialer with 10111 ready; the first press is what gets recorded.
        view.findViewById<View>(R.id.btnPrimary).setOnClickListener {
            if (GuardianAlerts.ack.value == Ack.NEW) setAck(Ack.HANDLING)
            startActivity(Intent(Intent.ACTION_DIAL, "tel:10111".toUri()))
        }

        // "Are they safe?" Yes stands down; No leaves everything as it was.
        view.findViewById<View>(R.id.btnStandDown).setOnClickListener {
            val beforeCalling = GuardianAlerts.ack.value == Ack.NEW
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Are they safe?")
                .setMessage(
                    if (beforeCalling) "Only stand down if you know they're safe. 10111 won't be called from this alert."
                    else "Only stand down if you know they're safe."
                )
                .setPositiveButton("Yes, stand down") { _, _ -> setAck(Ack.STOOD_DOWN) }
                .setNegativeButton("No", null)
                .show()
        }

        // After stand-down the spec lets the guardian call them (G4). The preview has
        // no member number, so the dialer opens empty.
        view.findViewById<View>(R.id.btnCallThem).setOnClickListener {
            startActivity(Intent(Intent.ACTION_DIAL))
        }

        view.findViewById<View>(R.id.btnBack).setOnClickListener { findNavController().navigateUp() }
        view.findViewById<View>(R.id.btnBackToStandby).setOnClickListener { findNavController().navigateUp() }

        view.findViewById<View>(R.id.linkTimeline).setOnClickListener {
            findNavController().navigate(R.id.action_guardianAlert_to_acknowledged)
        }

        render()
    }

    private fun setAck(ack: Ack) {
        GuardianAlerts.setAck(ack)
        render()
    }

    private fun render() {
        val view = view ?: return
        val ack = GuardianAlerts.ack.value

        view.findViewById<MaterialButton>(R.id.btnPrimary).apply {
            visibility = if (ack == Ack.NEW || ack == Ack.HANDLING) View.VISIBLE else View.GONE
            text = "Call 10111"
            setIconResource(R.drawable.ic_phone)
        }
        view.findViewById<View>(R.id.tvPreviewNote).visibility =
            if (ack == Ack.NEW || ack == Ack.HANDLING) View.VISIBLE else View.GONE

        view.findViewById<View>(R.id.statusLine).visibility =
            if (ack == Ack.HANDLING || ack == Ack.STOOD_DOWN) View.VISIBLE else View.GONE
        view.findViewById<TextView>(R.id.tvStatus).text = when (ack) {
            Ack.HANDLING -> "You pressed Call 10111, recorded. Not signed: device signing isn't built yet."
            Ack.STOOD_DOWN -> if (GuardianAlerts.called) {
                "Stood down. You confirmed they're safe."
            } else {
                "Stood down without calling 10111. You confirmed they're safe."
            }
            else -> null
        }

        view.findViewById<View>(R.id.btnStandDown).visibility =
            if (ack == Ack.NEW || ack == Ack.HANDLING) View.VISIBLE else View.GONE
        // The example timeline includes "Called 10111", so it only fits when they called.
        view.findViewById<View>(R.id.linkTimeline).visibility =
            if (GuardianAlerts.called && (ack == Ack.HANDLING || ack == Ack.STOOD_DOWN)) View.VISIBLE else View.GONE

        val stoodDown = ack == Ack.STOOD_DOWN
        view.findViewById<MaterialButton>(R.id.btnCallThem).apply {
            isEnabled = stoodDown
            alpha = if (stoodDown) 1f else 0.4f
            setIconResource(if (stoodDown) R.drawable.ic_phone else R.drawable.ic_phone_x)
        }
        view.findViewById<TextView>(R.id.tvCallLock).text = if (stoodDown) {
            "You stood down, so you can call them now. The alert itself is never withdrawn."
        } else {
            "Their phone ringing could put them in more danger, so calling them unlocks after " +
                "stand-down or when the incident closes. You can still use your phone for anything else, like reaching family."
        }
    }
}
