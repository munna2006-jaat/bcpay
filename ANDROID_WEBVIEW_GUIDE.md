# 📱 Android WebView Packaging Guide for EarnLoop App

This guide explains how to package your deployed EarnLoop web application into a native Android APK using Android Studio.

---

## 1. Prerequisites
- **Android Studio** (Hedgehog, Iguana, or later)
- Android SDK API Level 24 to 34 (Android 7.0 to 14.0+)
- Your live Render deployment URL: `https://YOUR-APP.onrender.com`

---

## 2. Project Setup in Android Studio
1. Open Android Studio -> **New Project** -> Select **Empty Views Activity**.
2. Name: `EarnLoop`
3. Package Name: `com.earnloop.rewards`
4. Language: **Kotlin** or **Java**
5. Minimum SDK: **API 24 (Android 7.0)**

---

## 3. Permissions in `AndroidManifest.xml`
Add Internet and Network state permissions inside `app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.earnloop.rewards">

    <!-- Network permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="EarnLoop"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.EarnLoop"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 4. Layout: `activity_main.xml`
In `app/src/main/res/layout/activity_main.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:layout_alignParentTop="true"
        android:max="100"
        android:progressTint="#0088FF"
        android:visibility="gone" />
</RelativeLayout>
```

---

## 5. Implementation: `MainActivity.kt`
In `app/src/main/java/com/earnloop/rewards/MainActivity.kt`:

```kotlin
package com.earnloop.rewards

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private val appUrl = "https://YOUR-APP.onrender.com" // Replace with your Render URL

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        // Ensure links stay inside WebView
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
            }
        }

        // Native Android Back Navigation Handling
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        webView.loadUrl(appUrl)
    }
}
```

---

## 6. Build the Signed APK
1. In Android Studio, go to **Build** -> **Generate Signed Bundle / APK**.
2. Select **APK** -> Click **Next**.
3. Create or select a Keystore, enter password.
4. Select **release** build variant -> Check **V1 and V2 (Full APK Signature)**.
5. Click **Finish**. Your output `.apk` file will be generated in `app/release/app-release.apk`!
