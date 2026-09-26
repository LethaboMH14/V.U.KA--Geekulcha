package com.teamsonar.vuka

import android.content.Intent
import android.os.Build
import android.view.WindowManager
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "VIGIL"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    showOverLockIfCheckin(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    showOverLockIfCheckin(intent)
  }

  /**
   * Opened by the journey-check notice (spec V4) or a guardian's alert notice:
   * show over the lock screen and wake the display. The alert notice also
   * tells JS to open the alert (Mutarisi's EXTRA_OPEN_ALERT).
   */
  private fun showOverLockIfCheckin(i: Intent?) {
    if (i?.getBooleanExtra(com.teamsonar.vuka.detect.HelpRequest.EXTRA, false) == true) {
      com.teamsonar.vuka.detect.HelpRequest.pending = true
    }
    val alert = i?.getBooleanExtra(com.teamsonar.vuka.detect.GuardianNotice.EXTRA, false) == true
    if (alert) com.teamsonar.vuka.detect.GuardianNotice.openPending = true
    if (alert || i?.getBooleanExtra(com.teamsonar.vuka.detect.CheckinNotice.EXTRA, false) == true) {
      if (Build.VERSION.SDK_INT >= 27) {
        setShowWhenLocked(true)
        setTurnScreenOn(true)
      } else {
        // setShowWhenLocked/setTurnScreenOn arrive in Android 8.1 (minSdk is 23).
        @Suppress("DEPRECATION")
        window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
      }
    }
  }
}
