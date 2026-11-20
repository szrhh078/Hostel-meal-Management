# HMS Pro Android build

This source package is prepared for an Android build with Capacitor. It is **not an APK yet**.

## Requirements on Windows
- Node.js 20 or newer
- Android Studio (current stable)
- Android SDK Platform and Build-Tools installed through Android Studio
- A JDK supported by the installed Android Gradle Plugin (Android Studio's bundled JBR is recommended)

## 1. Configure Supabase
Create `.env.local` in this folder using `.env.example` and your Supabase project URL and publishable/anon key. Do not use a service-role key in this client app.

## 2. Install dependencies and create the Android project
Open PowerShell in this folder and run:

```powershell
npm install
npx cap add android
npm run build:android
npx cap open android
```

If the `android` folder already exists, skip `npx cap add android`.

## 3. Build the APK in Android Studio
1. Wait for Gradle sync to finish.
2. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Android Studio will show a notification with **locate**. The debug APK is normally at `android/app/build/outputs/apk/debug/app-debug.apk`.

For a release APK, configure a signing key in Android Studio via **Build > Generate Signed Bundle / APK**. Keep the keystore and passwords private and backed up.

## Notes
- HMS Pro uses Supabase Auth and PostgreSQL; the Android app still requires a correctly configured Supabase project, schema/migrations, and network access.
- Google sign-in requires the OAuth provider and redirect URLs to be configured in Supabase/Google Cloud. Test this flow on the Android app before distributing it.
- This package was not compiled into an APK in this environment because Android SDK/Gradle tooling is not installed here and dependency installation could not complete. Follow the steps above on a computer with Android Studio to generate the APK.
