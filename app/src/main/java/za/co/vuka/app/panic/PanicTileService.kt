package za.co.vuka.app.panic

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import za.co.vuka.app.auth.AccountStore

/**
 * Quick Settings tile: swipe down, tap, and the alert is raised, from the
 * lock screen too. The panic screen can show over the lock screen, so no
 * unlock is needed. The tile is unavailable until someone is signed in as a
 * member, because there's no account to alert for.
 */
class PanicTileService : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        val tile = qsTile ?: return
        tile.state = if (signedIn()) Tile.STATE_INACTIVE else Tile.STATE_UNAVAILABLE
        tile.updateTile()
    }

    override fun onClick() {
        super.onClick()
        if (!signedIn()) return
        Panic.raise(this, Panic.Source.QS_TILE)
        showPanicScreen()
    }

    // The Intent overload only runs below API 34, where it's the supported call.
    @SuppressLint("StartActivityAndCollapseDeprecated")
    private fun showPanicScreen() {
        val intent = Panic.screenIntent(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // API 34+ only accepts a PendingIntent here.
            startActivityAndCollapse(
                PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
            )
        } else {
            @Suppress("DEPRECATION")
            startActivityAndCollapse(intent)
        }
    }

    private fun signedIn() = AccountStore(this).memberSignedIn
}
