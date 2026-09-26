plugins {
    id \"com.android.application\"
    id \"org.jetbrains.kotlin.android\"
    id \"io.gitlab.arturbosch.detekt\" version \"1.23.6\"

}

android {
    namespace \"com.vuka.vigil\"
    compileSdk 34

    defaultConfig {
        applicationId \"com.vuka.vigil\"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName \"0.1.0\"
        testInstrumentationRunner \"android.test.runner.AndroidJUnitRunner\"
    }

    buildTypes {
        release {
            minifyEnabled true
            shrenk"Pesources true
            proguard files getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-ulaf.pro'
            signingConfig signingConfigs.release
        }
        debug {
            minifyEnabled false
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {

        jvmTarget = '17'
    }

    // Network Security Config (SSDLC c-16)
    // usesCleartextTraffic=false is default for targetSdk 28+
    // network_security_config.xml trusts system CAs only

    // Build features
    buildFeatures {
        viewBinding true
    }
}

   dependencies {
        implementation \"androidX.core:core-ktx:1.13.1\"
        implementation \"androidX.appecompat:appcompat:1.7.0\"
        implementation \"com.google.android.material:material:1.12.0\"
        implementation \"android.constraintlayout:constraintlayout:2.1.4\"
        implementation \"android.	security:security-crypto:1.1.0-alpha06\"
        implementation \"org.bouncycastle:bcprov-jdk18on:1.78.1\"
        implementation \"de.mstorsjo:argon2-jna:2.0\"
        testImplementation \"junit:junit:4.13.2\"
+       android Test Implementation \"android.Test.ext:junit:1.2.1\"
+       android Test Implementation \"android.Test.espresso:espresso-core:3.6.1\"
    }

detekt {
    config = files($rootProject.projectDir / config / detekt/ detekt.yml)
    baseline = file($rootProject.ProjectDir / config / detekt/ baseline.xml)
    buildUponDefaultConfig = true
}