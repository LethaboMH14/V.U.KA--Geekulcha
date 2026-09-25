package za.co.vuka.app

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.navOptions
import za.co.vuka.app.auth.AccountStore
import za.co.vuka.app.ui.guardian.GuardianAlerts
import za.co.vuka.app.ui.settings.ThemePrefs
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private data class Tab(val viewId: Int, val destinationId: Int, val iconRes: Int, val label: String)

    private val tabs = listOf(
        Tab(R.id.tabHome, R.id.homeFragment, R.drawable.ic_shield_chevron, "Home"),
        Tab(R.id.tabRecord, R.id.recordFragment, R.drawable.ic_lock, "Record"),
        Tab(R.id.tabSettings, R.id.settingsFragment, R.drawable.ic_gear, "Settings"),
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        // Before super.onCreate, so the first frame already uses the saved theme.
        ThemePrefs.applySaved(this)
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val navHost = supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val nav = navHost.navController
        // Stay signed in: open where the saved roles left off. A member lands on
        // Home (their guardian role is in Settings); a guardian-only phone on
        // Standby. On recreation NavController restores its own back stack.
        val account = AccountStore(this)
        nav.setGraph(nav.navInflater.inflate(R.navigation.nav_graph).apply {
            setStartDestination(
                when {
                    account.memberSignedIn -> R.id.homeFragment
                    account.guardianEnrolled -> R.id.guardianStandbyFragment
                    else -> R.id.welcomeFragment
                }
            )
        }, null)
        bindBottomNav(nav)
        bindAlertBanner(nav)
        if (intent.getBooleanExtra(EXTRA_OPEN_ALERT, false)) openAlert(nav)
    }

    private fun bindBottomNav(nav: NavController) {
        val bar = findViewById<View>(R.id.bottomNav)

        tabs.forEach { tab ->
            findViewById<View>(tab.viewId).apply {
                findViewById<ImageView>(R.id.ivTabIcon).setImageResource(tab.iconRes)
                findViewById<TextView>(R.id.tvTabLabel).text = tab.label
                setOnClickListener {
                    if (nav.currentDestination?.id == tab.destinationId) return@setOnClickListener
                    // Home is the root once onboarding is cleared; the other tabs sit on top of it.
                    nav.navigate(tab.destinationId, null, navOptions {
                        popUpTo(R.id.homeFragment) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    })
                }
            }
        }

        nav.addOnDestinationChangedListener { _, destination, _ ->
            val active = tabs.firstOrNull { it.destinationId == destination.id }
            bar.visibility = if (active != null) View.VISIBLE else View.GONE
            tabs.forEach { tab -> renderTab(tab, selected = tab == active) }
            renderAlertBanner(nav)
        }
    }

    // The banner shows on every screen while an alert needs this guardian, except
    // on the alert itself. Tapping it opens the alert.
    private fun bindAlertBanner(nav: NavController) {
        findViewById<View>(R.id.alertBanner).setOnClickListener { openAlert(nav) }
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                combine(GuardianAlerts.active, GuardianAlerts.ack) { _, _ -> }.collect { renderAlertBanner(nav) }
            }
        }
    }

    private fun renderAlertBanner(nav: NavController) {
        val show = AccountStore(this).guardianEnrolled &&
            GuardianAlerts.needsAttention(GuardianAlerts.active.value, GuardianAlerts.ack.value) &&
            nav.currentDestination?.id != R.id.guardianAlertFragment
        findViewById<View>(R.id.alertBanner).visibility = if (show) View.VISIBLE else View.GONE
    }

    private fun openAlert(nav: NavController) {
        if (AccountStore(this).guardianEnrolled && nav.currentDestination?.id != R.id.guardianAlertFragment) {
            nav.navigate(R.id.guardianAlertFragment)
        }
    }

    // The alert notification (G3) opens the alert directly, whatever screen the app was on.
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (intent.getBooleanExtra(EXTRA_OPEN_ALERT, false)) openAlert(navController())
    }

    private fun navController() =
        (supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment).navController

    companion object {
        const val EXTRA_OPEN_ALERT = "open_guardian_alert"
    }

    private fun renderTab(tab: Tab, selected: Boolean) {
        val view = findViewById<View>(tab.viewId)
        val color = getColor(if (selected) R.color.vuka_text_inverse else R.color.vuka_text_secondary)
        if (selected) view.setBackgroundResource(R.drawable.bg_button_primary) else view.background = null
        view.findViewById<ImageView>(R.id.ivTabIcon).setColorFilter(color)
        view.findViewById<TextView>(R.id.tvTabLabel).apply {
            setTextColor(color)
            setTypeface(null, if (selected) android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
        }
        view.isSelected = selected
        view.contentDescription = tab.label + if (selected) ", selected" else ""
    }
}
