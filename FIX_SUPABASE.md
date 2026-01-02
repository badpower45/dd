# 🔧 إصلاح Supabase Configuration

## ❌ المشكلة
التطبيق بيقول: "supabase not config"

## ✅ الحل

### 1️⃣ احصل على Supabase Credentials

افتح Supabase Dashboard:
👉 https://supabase.com/dashboard

**Project Settings → API:**
- ✅ Project URL (مثال: `https://xxxxx.supabase.co`)
- ✅ anon public key (مثال: `eyJhbGciOi...`)

---

### 2️⃣ أضف الـ Credentials في app.json

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://YOUR_PROJECT.supabase.co",
      "supabaseAnonKey": "eyJhbGciOiJI...",
      "apiUrl": "https://your-api.com"
    }
  }
}
```

**⚠️ استبدل:**
- `YOUR_PROJECT` بـ project ID بتاعك
- `eyJhbGciOiJI...` بالـ anon key الحقيقي
- `https://your-api.com` بـ server URL (أو IP لو local)

---

### 3️⃣ Update client/lib/supabase.ts

تأكد إن الكود بيقرأ من app.json:

```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase not configured!');
}
```

---

### 4️⃣ Rebuild التطبيق

```bash
# Build جديد
eas build -p android --profile preview
```

---

## 🎯 Quick Fix (للتجربة السريعة)

**في app.json:**

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://xxxxxxxxxxx.supabase.co",
      "supabaseAnonKey": "eyJhbGciOi...your-real-key",
      "apiUrl": "http://192.168.1.130:5001"
    }
  }
}
```

**بعدها:**
```bash
eas build -p android --profile preview
```

---

## 📱 للتجربة المحلية (بدون rebuild)

إذا تريد تجرب محلياً أولاً:

```bash
npm start
# Scan QR من Expo Go
```

التطبيق على Expo Go سيقرأ من `.env` أو `config.ts` مباشرة.

---

## 🔐 Environment Variables (بديل)

يمكنك استخدام ملف `.env`:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_API_URL=http://192.168.1.130:5001
```

**في الكود:**
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

---

## 🆘 لو لسه المشكلة موجودة

```bash
# 1. Clear cache
npm start -- --clear

# 2. Rebuild
eas build -p android --profile preview --clear-cache
```

---

**Status:** Add credentials → Rebuild → Install new APK! 🚀
