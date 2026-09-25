package za.co.vuka.app.ui.guardian

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
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
 * "Call 10111" deliberately does not open the dialer from a preview. A real
 * alert should use Intent.ACTION_DIAL with tel:10111, which pre-fills the
 * number and never places the call itself. Responses aren't signed yet, so
 * nothing here claims they are.
 */
class GuardianAlertFragment : Fragment(R.layout.fragment_guardian_alert) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<View>(R.id.btnPrimary).setOnClickListener {
            when (GuardianAlerts.ack.value) {
                Ack.NEW -> setAck(Ack.CALLED)
                Ack.CALLED -> setAck(Ack.HANDLING)
                else -> Unit
            }
        }

        // "Are they safe?" Yes stands down; No leaves everything as it was.
        view.findViewById<View>(R.id.btnStandDown).setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Are they safe?")
                .setMessage("Only stand down if you know they're safe.")
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
            visibility = if (ack == Ack.NEW || ack == Ack.CALLED) View.VISIBLE else View.GONE
            text = if (ack == Ack.NEW) "Call 10111" else "I called 10111"
            setIconResource(if (ack == Ack.NEW) R.drawable.ic_phone else R.drawable.ic_seal_check)
        }
        view.findViewById<View>(R.id.tvPreviewNote).visibility =
            if (ack == Ack.NEW) View.VISIBLE else View.GONE

        view.findViewById<View>(R.id.statusLine).visibility =
            if (ack == Ack.HANDLING || ack == Ack.STOOD_DOWN) View.VISIBLE else View.GONE
        view.findViewById<TextView>(R.id.tvStatus).text = when (ack) {
            Ack.HANDLING -> "Response recorded. Not signed: device signing isn't built yet."
            Ack.STOOD_DOWN -> "Stood down. You confirmed they're safe."
            else -> null
        }

        view.findViewById<View>(R.id.btnStandDown).visibility =
            if (ack == Ack.HANDLING) View.VISIBLE else View.GONE
        view.findViewById<View>(R.id.linkTimeline).visibility =
            if (ack == Ack.HANDLING || ack == Ack.STOOD_DOWN) View.VISIBLE else View.GONE

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
