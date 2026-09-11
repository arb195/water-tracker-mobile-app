# آب‌یار Mobile — متصل به Vercel

این نسخه به‌صورت پیش‌فرض به بک‌اند زیر وصل می‌شود:

```text
https://your-api-route.com
```

> مهم: قبل از تست اپ، ZIP جداگانه‌ی `water-tracker-next-mobile-api-patch.zip` را روی پروژه Next.js اصلی merge و روی Vercel دوباره Deploy کن.

## اجرا

```bash
npm install
npx expo install --fix
npx expo-doctor@latest
npx expo start
```

برای Android Emulator می‌توانی کلید `a` را بزنی. برای native debug build:

```bash
npx expo run:android
```

## APK تستی لوکال

```bash
npx expo prebuild --platform android
cd android
```

Windows:

```powershell
gradlew.bat assembleDebug
```

macOS / Linux:

```bash
./gradlew assembleDebug
```

خروجی:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## APK امضاشده با EAS

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

## AAB برای Google Play

```bash
npx eas-cli@latest build --platform android --profile production
```

## APIهای موردنیاز

اپ از مسیرهای زیر استفاده می‌کند:

```text
POST /api/mobile/auth/register
POST /api/mobile/auth/login
POST /api/mobile/auth/logout
GET  /api/mobile/auth/me
POST /api/mobile/auth/set-pin
GET  /api/mobile/dashboard
GET  /api/mobile/history
GET  /api/mobile/leaderboard
POST /api/mobile/water
```
