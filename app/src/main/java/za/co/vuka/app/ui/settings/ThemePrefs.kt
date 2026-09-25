package za.co.vuka.app.ui.settings

import android.app.Activity
import android.content.Context
import android.util.TypedValue
import androidx.annotation.ColorInt
import androidx.annotation.ColorRes
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.edit
import za.co.vuka.app.R

/**
 * The member's theme choice, matching the prototype's Ivory, Silver and
 * Midnight, plus System (follow the phone's dark mode).
 *
 * How each theme applies:
 * - Ivory and Midnight are Android's light and dark night modes
 *   (values/colors.xml and values-night/colors.xml).
 * - Silver is light mode plus [R.style.ThemeOverlay_Vuka_Silver], which
 *   swaps the six ?attr/vuka* tokens.
 */
object ThemePrefs {

    enum class Theme(val nightMode: Int, val label: String, val silver: Boolean = false) {
        IVORY(AppCompatDelegate.MODE_NIGHT_NO, "Ivory"),
        SILVER(AppCompatDelegate.MODE_NIGHT_NO, "Silver", silver = true),
        MIDNIGHT(AppCompatDelegate.MODE_NIGHT_YES, "Midnight"),
        SYSTEM(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM, "System"),
    }

    private const val PREFS = "vuka_settings"
    private const val KEY_THEME = "theme"

    // Ivory is the prototype's default theme.
    fun get(context: Context): Theme {
        val name = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_THEME, Theme.IVORY.name)
        return Theme.entries.firstOrNull { it.name == name } ?: Theme.IVORY
    }

    /** Saves [theme] and redraws the activity in it. */
    fun set(activity: Activity, theme: Theme) {
        val previous = get(activity)
        activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit {
            putString(KEY_THEME, theme.name)
        }
        if (previous.nightMode != theme.nightMode) AppCompatDelegate.setDefaultNightMode(theme.nightMode)
        // A night-mode change only recreates the activity when the result differs,
        // and the Silver overlay isn't part of night mode, so make sure it redraws.
        if (previous.silver || theme.silver || previous.nightMode == theme.nightMode) activity.recreate()
    }

    /** Back to the default (Ivory). */
    fun reset(activity: Activity) = set(activity, Theme.IVORY)

    /** Call before super.onCreate, so the first frame already uses the saved theme. */
    fun applySaved(activity: Activity) {
        val theme = get(activity)
        if (AppCompatDelegate.getDefaultNightMode() != theme.nightMode) {
            AppCompatDelegate.setDefaultNightMode(theme.nightMode)
        }
        if (theme.silver) activity.theme.applyStyle(R.style.ThemeOverlay_Vuka_Silver, true)
    }
}

/**
 * A VUKA colour as the current theme sees it. The six tokens Silver swaps are
 * read from their theme attribute; every other token is a plain resource.
 */
@ColorInt
fun Context.vukaColor(@ColorRes res: Int): Int {
    val attr = when (res) {
        R.color.vuka_bg_base -> R.attr.vukaBgBase
        R.color.vuka_bg_elevated -> R.attr.vukaBgElevated
        R.color.vuka_border -> R.attr.vukaBorder
        R.color.vuka_border_subtle -> R.attr.vukaBorderSubtle
        R.color.vuka_border_emphasis -> R.attr.vukaBorderEmphasis
        R.color.vuka_action -> R.attr.vukaAction
        else -> return getColor(res)
    }
    val value = TypedValue()
    return if (theme.resolveAttribute(attr, value, true)) value.data else getColor(res)
}
