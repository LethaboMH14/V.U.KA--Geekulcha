package za.co.vuka.app.panic

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
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
 * The alert path isn't built ([AlertPath]), so the screen says nothing was
 * sent and leads with calling 10111.
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
