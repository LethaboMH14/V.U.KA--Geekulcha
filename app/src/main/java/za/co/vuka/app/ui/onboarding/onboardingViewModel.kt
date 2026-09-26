package za.co.vuka.app.ui.onboarding

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import za.co.vuka.app.api.ServerSync
import za.co.vuka.app.auth.AccountStore
import za.co.vuka.app.auth.InterimPasswordStore
import za.co.vuka.app.auth.InterimPinStore
import za.co.vuka.app.ui.guardian.GuardianAlerts
import za.co.vuka.app.ui.record.RecordEntry
import za.co.vuka.app.ui.record.RecordStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * The member's profile and session, shared by onboarding, Home and Settings.
 * While signed in, every change is saved to [AccountStore], so the app
 * reopens signed in.
 */
class OnboardingViewModel(application: Application) : AndroidViewModel(application) {

    companion object {
        /** Bump when doc_terms.txt changes, so the record shows which version was accepted. */
        const val TERMS_VERSION = "v0-draft"
    }

    private val store = AccountStore(application)

    private val _phoneNumber = MutableStateFlow("")
    val phoneNumber: StateFlow<String> = _phoneNumber

    private val _firstName = MutableStateFlow("")
    val firstName: StateFlow<String> = _firstName

    private val _surname = MutableStateFlow("")
    val surname: StateFlow<String> = _surname

    // The email/Google journey: the chosen account's address (SIMULATED chooser).
    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email

    private val _googleUsed = MutableStateFlow(false)
    val googleUsed: StateFlow<Boolean> = _googleUsed

    // SIMULATED invites. A count only: no guardian has accepted, so there is no name to show.
    private val _pendingInvites = MutableStateFlow(0)
    val pendingInvites: StateFlow<Int> = _pendingInvites

    init {
        if (store.memberSignedIn) {
            store.profile()?.let(::load)
            // Members registered before the server link existed get their server identity now.
            ServerSync.register(application)
        }
    }

    val memberSignedIn: Boolean get() = store.memberSignedIn
    val guardianEnrolled: Boolean get() = store.guardianEnrolled

    fun setPhoneNumber(number: String) {
        _phoneNumber.value = number
    }

    fun setName(first: String, last: String) {
        _firstName.value = first
        _surname.value = last
        persistIfSignedIn()
    }

    /**
     * Settings → Edit profile. Saves what changed and writes one "Profile
     * updated" entry to the record naming the fields (never their values).
     * Returns false when nothing changed.
     */
    fun updateProfile(first: String, last: String, phone: String, email: String): Boolean {
        val changed = buildList {
            if (first != _firstName.value || last != _surname.value) add("Name")
            if (phone != _phoneNumber.value) add("Mobile number")
            if (!email.equals(_email.value, ignoreCase = true)) add("Email")
        }
        if (changed.isEmpty()) return false
        if ("Email" in changed && email.isNotBlank()) InterimPasswordStore(getApplication()).changeEmail(email)
        _firstName.value = first
        _surname.value = last
        _phoneNumber.value = phone
        _email.value = email
        persistIfSignedIn()
        RecordStore.add(getApplication(), RecordEntry.Kind.PROFILE_UPDATED, changed.joinToString(", "))
        return true
    }

    fun setGoogleAccount(email: String, first: String, last: String) {
        _googleUsed.value = true
        _email.value = email
        _firstName.value = first
        _surname.value = last
    }

    /** The manual email route: the address is the member's own; the password is in InterimPasswordStore. */
    fun setEmailAccount(email: String) {
        _googleUsed.value = false
        _email.value = email.trim()
    }

    /** An email added on the code screen so the code can go there. How the account was made is unchanged. */
    fun setContactEmail(email: String) {
        _email.value = email.trim()
    }

    /**
     * True on the "Already have an account? Sign in" route. If the verified
     * number has no account here, the member is offered registration instead.
     */
    var signingIn = false

    fun usePhoneOnly() {
        _googleUsed.value = false
        _email.value = ""
    }

    fun addPendingInvite() {
        _pendingInvites.value += 1
        persistIfSignedIn()
    }

    /** Has this number registered on this phone before? Decides new account vs "Welcome back". */
    fun isRegistered(phone: String) = store.isRegistered(phone)

    /** End of onboarding: save the profile and stay signed in. */
    /** Ticked on "Create your account"; recorded when registration completes. */
    var termsAccepted = false

    /** Where the sign-up code went; becomes the default for password resets. */
    var verifiedByEmail = false

    fun completeRegistration() {
        store.saveProfile(currentProfile())
        store.recoveryChannel = if (verifiedByEmail) AccountStore.RecoveryChannel.EMAIL else AccountStore.RecoveryChannel.PHONE
        store.memberSignedIn = true
        ServerSync.register(getApplication())
        if (termsAccepted) {
            RecordStore.add(getApplication(), RecordEntry.Kind.TERMS_ACCEPTED, "Terms $TERMS_VERSION and Privacy notice")
        }
    }

    /** "Welcome back": restore the saved profile after its PIN was entered. */
    fun signInExisting() {
        store.profile()?.let(::load)
        store.memberSignedIn = true
    }

    /**
     * Ends the member session. The profile and PINs stay, so the member can
     * sign back in, and a guardian role on this phone is untouched.
     */
    fun signOut() {
        store.memberSignedIn = false
        load(AccountStore.Profile("", "", "", "", false, 0))
    }

    /** Wipes this phone's profile, PINs and record so onboarding starts from the beginning. */
    fun deleteProfile() {
        store.clear()
        InterimPinStore(getApplication()).clear()
        InterimPasswordStore(getApplication()).clear()
        RecordStore.clear(getApplication())
        GuardianAlerts.clear(getApplication())
        ServerSync.reset(getApplication())
        load(AccountStore.Profile("", "", "", "", false, 0))
    }

    fun enrolAsGuardian() {
        store.guardianEnrolled = true
    }

    /** Stops the guardian role only; a member account on this phone is untouched. */
    fun leaveAsGuardian() {
        store.guardianEnrolled = false
        GuardianAlerts.clear(getApplication())
    }

    private fun persistIfSignedIn() {
        if (store.memberSignedIn) store.saveProfile(currentProfile())
    }

    private fun currentProfile() = AccountStore.Profile(
        firstName = _firstName.value,
        surname = _surname.value,
        phone = _phoneNumber.value,
        email = _email.value,
        googleUsed = _googleUsed.value,
        pendingInvites = _pendingInvites.value,
    )

    private fun load(p: AccountStore.Profile) {
        _firstName.value = p.firstName
        _surname.value = p.surname
        _phoneNumber.value = p.phone
        _email.value = p.email
        _googleUsed.value = p.googleUsed
        _pendingInvites.value = p.pendingInvites
    }
}
