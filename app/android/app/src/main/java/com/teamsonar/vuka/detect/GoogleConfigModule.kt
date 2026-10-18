package com.teamsonar.vuka.detect

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

/**
 * The Firebase project's web OAuth client id, for Google sign-in (src/api/google.ts).
 *
 * The google-services Gradle plugin writes it from google-services.json (the
 * oauth_client with client_type 3) as the string resource
 * `default_web_client_id`. That file is optional in this repo, so the
 * resource is looked up by name rather than as R.string (which would not
 * compile without it): no file, no resource, no constant, and the app keeps
 * the SIMULATED Google route. The id is not a secret; it ships in every APK
 * built with it.
 */
class GoogleConfigModule(ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
    override fun getName() = "VigilGoogleConfig"

    override fun getConstants(): MutableMap<String, Any> {
        val res = reactApplicationContext.resources
        val id = res.getIdentifier("default_web_client_id", "string", reactApplicationContext.packageName)
        return if (id != 0) mutableMapOf("webClientId" to res.getString(id)) else mutableMapOf()
    }
}
