-keep class com.vuka.vigil.** { *; }
-keepclassmembers class com.vuka.vigil.** { *; }
-dontwarn org.bouncycastle.**
-dontwarn de.mstorsjo.**
-keep class org.bouncycastle.** { *; }
-keep class de.mstorsjo.** { *; }

# Strip debug logs in release (SSDLC C-19)
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}
