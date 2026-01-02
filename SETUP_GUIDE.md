# إعداد المشروع للإنتاج

## 1. إعداد Supabase

### إنشاء المشروع
1. اذهب إلى https://supabase.com
2. أنشئ حساب جديد أو سجل دخول
3. اضغط "New Project"
4. اختر Organization واسم المشروع
5. اختر region قريب من مستخدميك
6. اختر password قوي للـ database

### إعداد قاعدة البيانات
1. افتح SQL Editor في Supabase Dashboard
2. انسخ محتوى ملف `supabase-schema.sql`
3. الصقه في SQL Editor
4. اضغط "Run" لتنفيذ الكود

### الحصول على API Keys
1. اذهب إلى Settings > API
2. انسخ:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - anon/public key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### إعداد Row Level Security
- السكيما تحتوي على RLS policies جاهزة
- تأكد من تفعيل RLS على جميع الجداول
- للتطوير: Policies تسمح بـ public access
- للإنتاج: حدّث الـ policies لمزيد من الأمان

## 2. إعداد ملف البيئة

أنشئ ملف `.env` في جذر المشروع:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. تشغيل التطبيق

```bash
# تثبيت المكتبات
npm install

# تشغيل Expo
npm run dev

# أو لمنصة معينة
npm run android  # للأندرويد
npm run ios      # للآيفون
```

## 4. اختبار التطبيق

استخدم الحسابات التجريبية:

```
Admin: admin@demo.com / demo123
Dispatcher: dispatcher@demo.com / demo123
Restaurant: restaurant@demo.com / demo123
Driver: driver@demo.com / demo123
```

## 5. نشر التطبيق

### للويب
```bash
npm run expo:static:build
```

### للموبايل
استخدم Expo Application Services (EAS):

```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

## 6. Realtime Features

تأكد من تفعيل Realtime في Supabase:

1. اذهب إلى Database > Replication
2. فعّل replication للجداول:
   - orders
   - notifications

## 7. Performance Tips

### Database
- Indexes موجودة في السكيما
- استخدم `limit` في الـ queries
- فعّل connection pooling

### Frontend
- React Query تعمل caching تلقائي
- الصور تُرفع على Supabase Storage
- استخدم `memo` للمكونات الثقيلة

## 8. الأمان

### Production Checklist
- [ ] تحديث RLS policies
- [ ] تفعيل rate limiting في Supabase
- [ ] تأمين API keys
- [ ] تفعيل SSL/HTTPS
- [ ] مراجعة الـ CORS settings

### حماية البيانات
```sql
-- مثال: تحديث policy للطلبات
DROP POLICY IF EXISTS "Orders are publicly readable" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    restaurant_id = auth.uid()::int 
    OR driver_id = auth.uid()::int
  );
```

## 9. Monitoring

راقب التطبيق من خلال:
- Supabase Dashboard > Logs
- Supabase Dashboard > Database > Performance
- Sentry للأخطاء (اختياري)

## 10. Backup

Supabase يعمل backup تلقائي، لكن يمكنك:

```bash
# Export database
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql

# Import database
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup.sql
```

## مشاكل شائعة

### لا يمكن الاتصال بـ Supabase
- تأكد من صحة URL و API Key
- تأكد من اتصالك بالإنترنت
- تحقق من firewall settings

### الـ Realtime لا يعمل
- تأكد من تفعيل Replication
- تحقق من RLS policies
- راجع console logs

### البيانات لا تظهر
- تأكد من تنفيذ schema.sql
- تحقق من وجود demo users
- راجع SQL logs في Supabase

## دعم فني

للمساعدة:
1. راجع Supabase Docs: https://supabase.com/docs
2. Expo Docs: https://docs.expo.dev
3. افتح issue على GitHub
