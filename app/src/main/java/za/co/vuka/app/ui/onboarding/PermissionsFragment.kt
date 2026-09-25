package za.co.vuka.app.ui.onboarding

import android.Manifest
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.DrawableRes
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R

/**
 * Onboarding step 6 — Permissions. Microphone and notifications are required
 * to arm; location is optional. Unlike the prototype's DemoPanel toggles, these
 * are the phone's real runtime permission states.
 */
class PermissionsFragment : Fragment(R.layout.fragment_permissions) {

    // Chips read "Not asked yet" until the system dialog has been shown once,
    // so an unasked permission is never reported as refused.
    private var hasRequested = false

    private val requestPermissions = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) {
        hasRequested = true
        render()
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        hasRequested = savedInstanceState?.getBoolean(KEY_REQUESTED) ?: false

        bindRow(view.findViewById(R.id.rowMic), R.drawable.ic_microphone, "Microphone", optional = false)
        bindRow(view.findViewById(R.id.rowNotif), R.drawable.ic_bell, "Notifications", optional = false)
        bindRow(view.findViewById(R.id.rowLocation), R.drawable.ic_map_pin, "Location", optional = true)

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            findNavController().navigateUp()
        }

        view.findViewById<View>(R.id.btnContinue).setOnClickListener {
            val missing = missingPermissions()
            if (!hasRequested && missing.isNotEmpty()) {
                requestPermissions.launch(missing.toTypedArray())
                return@setOnClickListener
            }
            findNavController().navigate(R.id.action_permissions_to_setPins)
        }

        view.findViewById<View>(R.id.btnOpenSettings).setOnClickListener {
            startActivity(
                Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.fromParts("package", requireContext().packageName, null)
                )
            )
        }
    }

    // Re-check on every resume: the user may be returning from system Settings.
    override fun onResume() {
        super.onResume()
        render()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putBoolean(KEY_REQUESTED, hasRequested)
    }

    private fun render() {
        val view = view ?: return
        val micGranted = isGranted(Manifest.permission.RECORD_AUDIO)
        val notifGranted = NotificationManagerCompat.from(requireContext()).areNotificationsEnabled()
        val locationGranted = isGranted(Manifest.permission.ACCESS_FINE_LOCATION) ||
            isGranted(Manifest.permission.ACCESS_COARSE_LOCATION)

        renderRow(
            view.findViewById(R.id.rowMic), micGranted,
            reason = "To listen for distress sounds while a journey is armed.",
            deniedNote = "VIGIL can't arm without this."
        )
        renderRow(
            view.findViewById(R.id.rowNotif), notifGranted,
            reason = "To show the Journey check and the active-journey notice.",
            deniedNote = "VIGIL can't arm without this."
        )
        renderRow(
            view.findViewById(R.id.rowLocation), locationGranted,
            reason = "Optional — shares a fix with guardians if you don't answer a check.",
            deniedNote = "Arming still works, without a location fix."
        )

        val blocked = hasRequested && !(micGranted && notifGranted)
        view.findViewById<View>(R.id.errorContainer).visibility = if (blocked) View.VISIBLE else View.GONE
        view.findViewById<View>(R.id.btnContinue).visibility = if (blocked) View.GONE else View.VISIBLE
        view.findViewById<View>(R.id.btnOpenSettings).visibility = if (blocked) View.VISIBLE else View.GONE
        view.findViewById<View>(R.id.tvFullScreenNote).visibility =
            if (fullScreenAlertsBlocked()) View.VISIBLE else View.GONE
    }

    private fun bindRow(row: View, @DrawableRes icon: Int, title: String, optional: Boolean) {
        row.findViewById<ImageView>(R.id.ivIcon).setImageResource(icon)
        row.findViewById<TextView>(R.id.tvTitle).text = if (optional) "$title · optional" else title
    }

    private fun renderRow(row: View, granted: Boolean, reason: String, deniedNote: String) {
        val denied = hasRequested && !granted
        row.findViewById<TextView>(R.id.tvStatus).text = when {
            granted -> "Allowed"
            denied -> "Not allowed"
            else -> "Not asked yet"
        }
        row.findViewById<TextView>(R.id.tvReason).text = if (denied) deniedNote else reason
    }

    private fun missingPermissions(): List<String> = buildList {
        if (!isGranted(Manifest.permission.RECORD_AUDIO)) add(Manifest.permission.RECORD_AUDIO)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            !isGranted(Manifest.permission.POST_NOTIFICATIONS)
        ) {
            add(Manifest.permission.POST_NOTIFICATIONS)
        }
        if (!isGranted(Manifest.permission.ACCESS_FINE_LOCATION) &&
            !isGranted(Manifest.permission.ACCESS_COARSE_LOCATION)
        ) {
            // Android 12+ requires coarse alongside fine; the user may pick approximate.
            add(Manifest.permission.ACCESS_FINE_LOCATION)
            add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }
    }

    // Android 14+ lets the user (or Play policy) revoke full-screen intents.
    private fun fullScreenAlertsBlocked(): Boolean =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE &&
            !requireContext().getSystemService(NotificationManager::class.java).canUseFullScreenIntent()

    private fun isGranted(permission: String) =
        ContextCompat.checkSelfPermission(requireContext(), permission) == PackageManager.PERMISSION_GRANTED

    companion object {
        private const val KEY_REQUESTED = "permissions_requested"
    }
}
