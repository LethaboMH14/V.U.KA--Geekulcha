package za.co.vuka.app.panic

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.enableEdgeToEdge
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.launch
import za.co.vuka.app.api.ServerSync
import androidx.core.net.toUri
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import za.co.vuka.app.R
import za.co.vuka.app.ui.settings.ThemePrefs

/**
 * The screen after a panic alert. It is its own activity so the Quick
 * Settings tile can show it over the lock screen without an unlock. That's
 * why it shows nothing private and links nowhere else in the app.
 *
 * The alert goes to the server ([AlertPath]); the chip shows whether it has
 * arrived, and the screen still leads with calling 10111.
 */
class PanicActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemePrefs.applySaved(this)
        super.onCreate(savedInstanceState)
        showOverLockScreen()
        enableEdgeToEdge()
        setContentView(R.layout.activity_panic)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.panicRoot)) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }

        findViewById<android.view.View>(R.id.btnCall).setOnClickListener {
            // ACTION_DIAL pre-fills the number and never places the call itself.
            startActivity(Intent(Intent.ACTION_DIAL, "tel:10111".toUri()))
        }
        findViewById<android.view.View>(R.id.btnClose).setOnClickListener { finish() }

        // Whether the alert has reached the server, from the outbox.
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                ServerSync.status.collect { s ->
                    val (chip, detail) = when {
                        s.waiting == 0 && s.lastError == null -> "Sent" to "RECEIVED BY THE SERVER"
                        s.lastError == "can't reach the server" -> "Waiting" to "NO CONNECTION · SENDS WHEN ONLINE"
                        else -> "Sending" to "SENDING TO THE SERVER…"
                    }
                    findViewById<TextView>(R.id.tvSendState).text = chip
                    findViewById<TextView>(R.id.tvSendDetail).text = detail
                }
            }
        }
    }

    @Suppress("DEPRECATION")
    private fun showOverLockScreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
        } else {
            window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
        }
    }
}
