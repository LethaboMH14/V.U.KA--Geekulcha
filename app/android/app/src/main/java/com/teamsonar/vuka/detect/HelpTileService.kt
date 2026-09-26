package com.teamsonar.vuka.detect

import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.service.quicksettings.TileService
import com.teamsonar.vuka.MainActivity

/** Set when VIGIL was opened from its Quick Settings tile; read once by JS. */
object HelpRequest {
    const val EXTRA = "vigil_help"
    @Volatile var pending = false
}

/**
 * Hold-for-help from the Quick Settings panel (Mutarisi's design; ADR-0049,
 * PROPOSED): one tap opens VIGIL, which opens a check-in at once. The tile is
 * labelled only "VUKA", like the app.
 */
class HelpTileService : TileService() {
    override fun onClick() {
        super.onClick()
        val open = Intent(this, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra(HelpRequest.EXTRA, true)
        HelpRequest.pending = true
        if (Build.VERSION.SDK_INT >= 34) {
            startActivityAndCollapse(PendingIntent.getActivity(this, 7005, open, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
        } else {
            @Suppress("DEPRECATION")
            startActivityAndCollapse(open)
        }
    }
}
