package za.co.vuka.app.auth

import android.content.Context
import androidx.core.content.edit

/**
 * The account saved on this phone, so a member stays signed in across
 * launches. Sign-out ends the session but keeps the profile and PINs, so
 * the same number can sign back in with its PIN ("Welcome back").
 *
 * Being a member and being a guardian are independent: one person can be
 * protected and protect someone else ("Guardian mode, same APK", spec G1).
 *
 * LOCAL ONLY: there is no account server, so "does this number have an
 * account?" can only mean "was it registered on this phone?".
 */
class AccountStore(context: Context) {

    data class Profile(
        val firstName: String,
        val surname: String,
        val phone: String,
        val email: String,
        val googleUsed: Boolean,
        val pendingInvites: Int,
    )

    private val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    init {
        // Older builds kept one exclusive "session" value; split it into the two roles.
        prefs.getString(KEY_SESSION_OLD, null)?.let { old ->
            prefs.edit {
                putBoolean(KEY_MEMBER, old == "MEMBER")
                putBoolean(KEY_GUARDIAN, old == "GUARDIAN")
                remove(KEY_SESSION_OLD)
            }
        }
    }

    /** Signed in as a member (protected by VIGIL). */
    var memberSignedIn: Boolean
        get() = prefs.getBoolean(KEY_MEMBER, false)
        set(value) = prefs.edit { putBoolean(KEY_MEMBER, value) }

    /** Enrolled as a guardian for someone else. */
    var guardianEnrolled: Boolean
        get() = prefs.getBoolean(KEY_GUARDIAN, false)
        set(value) = prefs.edit { putBoolean(KEY_GUARDIAN, value) }

    fun profile(): Profile? {
        val phone = prefs.getString(KEY_PHONE, null) ?: return null
        return Profile(
            firstName = prefs.getString(KEY_FIRST, "").orEmpty(),
            surname = prefs.getString(KEY_SURNAME, "").orEmpty(),
            phone = phone,
            email = prefs.getString(KEY_EMAIL, "").orEmpty(),
            googleUsed = prefs.getBoolean(KEY_GOOGLE, false),
            pendingInvites = prefs.getInt(KEY_INVITES, 0),
        )
    }

    fun saveProfile(profile: Profile) = prefs.edit {
        putString(KEY_FIRST, profile.firstName)
        putString(KEY_SURNAME, profile.surname)
        putString(KEY_PHONE, profile.phone)
        putString(KEY_EMAIL, profile.email)
        putBoolean(KEY_GOOGLE, profile.googleUsed)
        putInt(KEY_INVITES, profile.pendingInvites)
    }

    /** Removes the profile and session from this phone. */
    fun clear() = prefs.edit { clear() }

    /** True when this number completed registration on this phone before. A skipped (blank) number never matches. */
    fun isRegistered(phone: String) = phone.isNotBlank() && profile()?.phone == phone

    private companion object {
        const val PREFS = "vuka_account"
        const val KEY_SESSION_OLD = "session"
        const val KEY_MEMBER = "member_signed_in"
        const val KEY_GUARDIAN = "guardian_enrolled"
        const val KEY_FIRST = "first_name"
        const val KEY_SURNAME = "surname"
        const val KEY_PHONE = "phone"
        const val KEY_EMAIL = "email"
        const val KEY_GOOGLE = "google_used"
        const val KEY_INVITES = "pending_invites"
    }
}
