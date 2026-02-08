# 🔒 Security Tests - Customer Portal

Bu klasör, Customer Portal uygulamasının güvenlik açıklarını tespit etmek için kapsamlı güvenlik testleri içerir.

## 📋 Test Dosyaları

### 1. `api-authorization.spec.ts`
**API Yetkilendirme ve Erişim Kontrolü Testleri**

Bu testler farklı kullanıcı rollerinin API endpoint'lerine erişim yetkilerini kontrol eder.

#### Test Edilen Kullanıcılar:
- **EFSORA_ADMIN** (`admin@efsora.com`) - Tam sistem erişimi
- **CUSTOMER** (`customeradmin@apex.com`) - Apex şirketi erişimi
- **CUSTOMER** (`sarah.wilson@apex.com`) - Sınırlı Apex erişimi
- **CUSTOMER** (`customer@demo.com`) - Demo şirketi erişimi

#### Kontrol Edilen Güvenlik Açıkları:
- ✅ Admin olmayan kullanıcıların `/api/v1/users` endpoint'ine erişimi engellenmeli
- ✅ Customer kullanıcılar sadece kendi şirket verilerine erişebilmeli
- ✅ Yetkisiz projlere erişim engellenmiş olmalı
- ✅ Cross-account veri sızıntısı olmamalı
- ✅ Hassas admin alanlarının customer'lara gösterilmemesi
- ✅ Hata mesajlarında sistem bilgisi sızmaması

#### Beklenen Sonuçlar:
```
❌ FAIL: Customer kullanıcı /api/v1/users endpoint'ine erişebiliyor (GÜVENLİK AÇIĞI!)
❌ FAIL: Customer kullanıcı diğer şirketlerin verilerini görebiliyor
✅ PASS: Admin tüm verilere erişebiliyor
✅ PASS: Kimlik doğrulaması olmayan istekler reddediliyor
```

### 2. `injection-attacks.spec.ts`
**Injection Saldırılarına Karşı Koruma Testleri**

Uygulamayı çeşitli injection saldırı türlerine karşı test eder.

#### Test Edilen Saldırı Türleri:

##### 🛡️ SQL Injection
- Login formunda SQL injection denemeleri
- API query parametrelerinde SQL injection
- Arama fonksiyonlarında SQL injection
```sql
' OR '1'='1
'; DROP TABLE users--
' UNION SELECT NULL--
```

##### 🛡️ XSS (Cross-Site Scripting)
- Login formunda XSS payload'ları
- Kullanıcı içeriğinde XSS escape kontrolü
- API response'larında script tag kontrolü
```html
<script>alert("XSS")</script>
<img src=x onerror=alert("XSS")>
<svg/onload=alert("XSS")>
```

##### 🛡️ Command Injection
- Input alanlarında sistem komutları
```bash
; ls -la
| cat /etc/passwd
$(whoami)
```

##### 🛡️ Path Traversal
- Dosya yolu manipülasyonu
```
../../../etc/passwd
..\\..\\..\\windows\\system32\\config\\sam
```

##### 🛡️ LDAP Injection
- LDAP query manipülasyonu
```
*)(&
*)(objectClass=*
```

##### 🛡️ NoSQL Injection
- MongoDB query manipülasyonu
```json
{"$gt": ""}
{"$ne": null}
{"$regex": ".*"}
```

### 3. `session-security.spec.ts`
**Session Yönetimi ve CSRF Koruması Testleri**

Session güvenliği, CSRF koruması, rate limiting ve diğer güvenlik mekanizmalarını test eder.

#### Test Edilen Özellikler:

##### 🔐 Session Management
- ✅ Logout sonrası session invalidation
- ✅ Farklı kullanıcılar arası session izolasyonu
- ✅ Session cookie'lerinde HttpOnly ve Secure flag'leri
- ✅ Session timeout kontrolü
- ✅ Session hijacking koruması

##### 🛡️ CSRF Protection
- ✅ POST isteklerinde CSRF token kontrolü
- ✅ DELETE isteklerinde CSRF token kontrolü
- ✅ PUT isteklerinde CSRF token kontrolü

##### ⏱️ Rate Limiting
- ✅ Login endpoint'inde rate limiting
- ✅ API endpoint'lerinde rate limiting (429 Too Many Requests)

##### 🔒 Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
X-XSS-Protection: 1; mode=block
Content-Security-Policy: ...
```

##### 🔑 Password Security
- ✅ Network trafiğinde şifre güvenliği
- ✅ Password field'da autocomplete kontrolü

##### 🚫 Information Disclosure
- ✅ Hata sayfalarında sistem bilgisi sızıntısı kontrolü
- ✅ API hatalarında stack trace sızıntısı kontrolü
- ✅ Server version number'ların gizlenmesi

## 🚀 Testleri Çalıştırma

### Tüm Security Testlerini Çalıştırma:
```bash
npx playwright test tests/customerportal/security
```

### Belirli Bir Test Dosyasını Çalıştırma:
```bash
# API Authorization testleri
npx playwright test tests/customerportal/security/api-authorization.spec.ts

# Injection saldırı testleri
npx playwright test tests/customerportal/security/injection-attacks.spec.ts

# Session güvenlik testleri
npx playwright test tests/customerportal/security/session-security.spec.ts
```

### Debug Mode'da Çalıştırma:
```bash
npx playwright test tests/customerportal/security --debug
```

### Headed Mode'da Çalıştırma (Tarayıcıyı görerek):
```bash
npx playwright test tests/customerportal/security --headed
```

### Tek Bir Testi Çalıştırma:
```bash
npx playwright test tests/customerportal/security -g "should NOT access all users endpoint"
```

### HTML Report Oluşturma:
```bash
npx playwright test tests/customerportal/security
npx playwright show-report
```

## 🎯 Beklenen Test Sonuçları

### ❌ Şu Anda Fail Edecek Testler (Güvenlik Açıkları):

1. **Customer kullanıcı tüm user bilgilerine erişebiliyor**
   - Test: `CUSTOMER should NOT access all users endpoint`
   - Açık: `/api/v1/users` endpoint'i yetki kontrolü yapmıyor
   - Risk: **Yüksek** - Tüm kullanıcı bilgileri sızıyor

2. **Customer kullanıcı diğer şirketlerin verilerini görebiliyor** (muhtemel)
   - Test: `CUSTOMER should only see their own company data`
   - Açık: `/api/v1/companies` endpoint'i yeterli filtreleme yapmıyor
   - Risk: **Yüksek** - Cross-account veri erişimi

3. **Customer kullanıcı yetkisiz projelere erişebiliyor** (muhtemel)
   - Test: `CUSTOMER should only access their own projects`
   - Açık: `/api/v1/projects/team` endpoint'i yetki kontrolü yapmıyor
   - Risk: **Orta** - Proje bilgileri sızıyor

### ✅ Pass Etmesi Gereken Testler:

1. **Admin tüm verilere erişebiliyor**
2. **Session logout sonrası invalidate ediliyor**
3. **SQL Injection engellenmiş**
4. **XSS engellenmiş**
5. **CSRF koruması çalışıyor**

## 🔧 Güvenlik Açıklarını Düzeltme

### 1. API Yetkilendirme Düzeltmeleri

Backend API'de middleware ekleyin:

```javascript
// middleware/authorization.js
function requireAdmin(req, res, next) {
  if (req.user.role !== 'EFSORA_ADMIN') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required' 
    });
  }
  next();
}

function filterByUserCompany(req, res, next) {
  if (req.user.role === 'CUSTOMER') {
    req.query.companyId = req.user.companyId;
  }
  next();
}

// routes/users.js
router.get('/api/v1/users', requireAdmin, getUsers);

// routes/companies.js
router.get('/api/v1/companies', filterByUserCompany, getCompanies);

// routes/projects.js
router.get('/api/v1/projects/team', validateProjectAccess, getProjectTeam);
```

### 2. Rate Limiting Ekleme

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 5 deneme
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, loginController);
```

### 3. Security Headers Ekleme

```javascript
const helmet = require('helmet');

app.use(helmet({
  frameguard: { action: 'deny' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

## 📊 Test Coverage

| Kategori | Test Sayısı | Öncelik |
|----------|-------------|---------|
| API Authorization | 15+ | 🔴 Critical |
| SQL Injection | 8+ | 🔴 Critical |
| XSS Prevention | 6+ | 🔴 Critical |
| Session Management | 7+ | 🟡 High |
| CSRF Protection | 3+ | 🟡 High |
| Rate Limiting | 2+ | 🟡 High |
| Command Injection | 5+ | 🟢 Medium |
| Path Traversal | 3+ | 🟢 Medium |
| Information Disclosure | 4+ | 🟢 Medium |

## 🐛 Bilinen Sorunlar

1. **Critical**: `/api/v1/users` endpoint'i herkes tarafından erişilebilir
2. **Critical**: Customer kullanıcılar diğer şirketlerin verilerini görebiliyor
3. **High**: Rate limiting eksik
4. **Medium**: Session timeout kontrolü eksik

## 📚 Referanslar

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Playwright Security Testing](https://playwright.dev/docs/test-api-testing)

## 💡 Best Practices

1. ✅ Her deployment öncesi security testleri çalıştırın
2. ✅ CI/CD pipeline'a security testleri ekleyin
3. ✅ Fail olan testleri production'a geçirmeden düzeltin
4. ✅ Düzenli olarak yeni güvenlik açıklarını test edin
5. ✅ Security test coverage'ı %80'in üzerinde tutun

## 🤝 Katkıda Bulunma

Yeni güvenlik testleri eklerken:
1. Test açıklamasını net yazın
2. Beklenen ve gerçek sonucu logla
3. OWASP kategorisine göre organize edin
4. README'yi güncelleyin

---

**⚠️ UYARI**: Bu testler gerçek güvenlik açıklarını tespit etmek için tasarlanmıştır. 
Production ortamında çalıştırırken dikkatli olun ve rate limiting'e takılabilirsiniz.
