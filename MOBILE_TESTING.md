# 📱 دليل التشغيل على الموبايل

## ✅ تم عمل Database Schema بنجاح!

---

## 🚀 خطوات التشغيل على الموبايل

### 1️⃣ تحميل Expo Go

**iOS:**
- App Store → ابحث عن "Expo Go"
- أو: https://apps.apple.com/app/expo-go/id982107779

**Android:**
- Play Store → ابحث عن "Expo Go"  
- أو: https://play.google.com/store/apps/details?id=host.exp.exponent

---

### 2️⃣ تشغيل السيرفر

**Terminal 1:**
```bash
npm run server:local
```

✅ يجب تشوف: `express server serving on port 5001`

---

### 3️⃣ تشغيل التطبيق

**Terminal 2:**
```bash
npm start
```

✅ هيظهر QR Code على الشاشة

---

### 4️⃣ فتح التطبيق على الموبايل

**iOS:**
1. افتح Camera app
2. صور الـ QR Code
3. اضغط على الـ notification اللي تظهر

**Android:**
1. افتح Expo Go app
2. اضغط "Scan QR Code"
3. صور الـ QR Code

---

## ⚠️ مهم جداً!

### تأكد من:
1. ✅ الموبايل والكمبيوتر على **نفس الواي فاي**
2. ✅ السيرفر شغال على port 5001
3. ✅ Firewall مش بيمنع الاتصال

---

## 🔧 لو التطبيق مش شغال

### Problem: Cannot connect to Metro

**Solution:**
```bash
# في Terminal 2:
npm start -- --tunnel
```

### Problem: Server not responding

**Check IP:**
```bash
# اعرف IP الجهاز:
ifconfig | grep "inet "
```

**Update config:**
```typescript
// في client/lib/config.ts
export const API_URL = "http://YOUR_IP:5001";
// مثال: "http://192.168.1.5:5001"
```

---

## 🧪 Test الـ Demo Accounts

بعد ما التطبيق يفتح:

```
Admin:
📧 admin@demo
🔒 admin123

Driver:
📧 driver@demo
🔒 driver123

Restaurant:
📧 restaurant@demo
🔒 rest123
```

---

## 🎯 Features للتجربة

1. **Login** ✅
   - جرب أي demo account

2. **Multi-language** ✅
   - Profile → اضغط Language
   - بدل من العربي للإنجليزي

3. **Analytics** (Admin) ✅
   - Tab "التحليلات"
   - شوف الـ charts

4. **Notifications** ✅
   - Tab "الإشعارات"
   - Mark as read

5. **Leaderboard** (Driver) ✅
   - Tab "الصدارة"
   - شوف أفضل السائقين

---

## 📊 Quick Commands

```bash
# Terminal 1 - Server
npm run server:local

# Terminal 2 - App  
npm start

# Check types (optional)
npm run check:types

# Format code (optional)
npm run format
```

---

## 🆘 المشاكل الشائعة

### 1. "Unable to resolve module"
```bash
# Clear cache
npm start -- --clear
```

### 2. "Network response timed out"
```bash
# Use tunnel
npm start -- --tunnel
```

### 3. White screen
```bash
# Check server is running
curl http://localhost:5001/api/orders
```

---

## 🎊 جاهز!

**Next:**
1. ✅ Terminal 1: `npm run server:local`
2. ✅ Terminal 2: `npm start`
3. ✅ Scan QR Code
4. ✅ Login: `admin@demo / admin123`
5. 🎉 استمتع!

---

**Status: Ready to Test on Mobile! 📱**
