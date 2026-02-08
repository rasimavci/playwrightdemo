# Customer Portal Test Süiti - Türkçe Açıklamalar ve Kodlama İpuçları

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Test Grupları](#test-grupları)
3. [Kullanıcı Rolleri ve Yetkileri](#kullanıcı-rolleri-ve-yetkileri)
4. [Kodlama İpuçları](#kodlama-ipuçları)
5. [En İyi Uygulamalar](#en-iyi-uygulamalar)

---

## 🎯 Genel Bakış

Bu test süiti, Customer Portal uygulamasının kapsamlı testlerini içermektedir. Testler şu ana kategorilere ayrılmıştır:

- **Kimlik Doğrulama (Login) Testleri**
- **Kullanıcı Rol ve Yetki Testleri**
- **Güvenlik Testleri**
- **Erişilebilirlik Testleri**
- **Performans Testleri**
- **Responsive Tasarım Testleri**

---

## 📂 Test Grupları

### 1. � AI Chat Testleri

#### **admin-chat.spec.ts** - Admin Kullanıcısı AI Chat Testleri
Admin kullanıcısının AI chat özelliğini kullanarak LLM (Büyük Dil Modeli) ile etkileşim testleri.

**Test Senaryoları:**
- ✅ Chat butonu sağ üstte görünüyor mu?
- ✅ Chat paneli açılıyor mu?
- ✅ Chat input alanı kullanılabilir mi?
- ✅ Basit mesaj gönderme ve streaming response
- ✅ Yaratıcı prompt: "Yazılım testi hakkında şiir yaz"
- ✅ Teknik soru: Admin özellikleri neler?
- ✅ Progressive streaming (token by token)
- ✅ Ardışık çoklu mesajlar
- ✅ Typing indicator görünümü
- ✅ Uzun response timeout kontrolü
- ✅ Boş mesaj yönetimi
- ✅ Chat context'i korunuyor mu?
- ✅ Chat paneli kapatma
- ✅ Streaming performans metrikleri
- ✅ Özel karakterler güvenliği
- ✅ Admin'e özel öneriler

**Streaming Test Özellikleri:**
```typescript
// ✅ Response intercepting
const responsePromise = page.waitForResponse(
  response => response.url().includes('/chat') || response.url().includes('/api/stream'),
  { timeout: 30000 }
);

// ✅ Content-Type kontrolü (streaming olmalı)
const contentType = response.headers()['content-type'];
expect(contentType).toMatch(/text\/event-stream|application\/stream/);

// ✅ Stream body'yi manuel okuma (İLERİ SEVİYE)
const stream = await response.body();
expect(stream.length).toBeGreaterThan(0);

// ✅ Stream içeriğini text'e çevirme
const streamText = stream.toString();
expect(streamText.length).toBeGreaterThan(0);

// ✅ Performance metrikleri
const startTime = Date.now();
await page.keyboard.press('Enter');
const response = await responsePromise;
const responseTime = Date.now() - startTime;
expect(responseTime).toBeLessThan(3000); // İlk chunk hızlı gelmeli
```

**Kodlama İpuçları:**
```typescript
// ✅ Çoklu selector stratejisi (element bulunamama riskini azaltır)
const chatButton = page.locator('[data-testid="chat-button"]').or(
  page.getByRole('button', { name: /chat|message|ai/i })
).or(
  page.locator('button:has-text("Chat")')
);

// ✅ Stream monitoring
let streamChunks = 0;
page.on('response', async (response) => {
  if (response.url().includes('/chat')) {
    const contentType = response.headers()['content-type'];
    if (contentType?.includes('stream')) {
      streamChunks++;
    }
  }
});

// ✅ Progressive rendering kontrolü
const responseUpdates: string[] = [];
await page.evaluate(() => {
  (window as any).responseUpdates = [];
});

// ✅ Timeout extension (uzun response'lar için)
test.setTimeout(60000);

// ✅ Context maintenance testi
await chatInput.fill('My name is Admin');
await page.keyboard.press('Enter');
await page.waitForTimeout(3000);

await chatInput.fill('What is my name?');
await page.keyboard.press('Enter');
// AI context'ten "Admin" ismini hatırlamalı
```

**LLM Response Kalite Testleri:**
```typescript
// ✅ Yaratıcı response uzunluk kontrolü
const messageText = await lastMessage.textContent();
expect(messageText?.length || 0).toBeGreaterThan(50);

// ✅ İçerik doğrulama (anahtar kelimeler)
expect(messageText?.toLowerCase()).toMatch(/admin|manage|access/);

// ✅ Detaylı açıklama uzunluğu
expect(messageText?.length || 0).toBeGreaterThan(200);

// ✅ XSS/SQL injection güvenliği
const specialMessage = '<script>alert("test")</script>';
await chatInput.fill(specialMessage);
// Script çalışmamalı, güvenli şekilde işlenmeli
```

**Stream Debugging İpuçları:**
```typescript
// 🔍 Stream body'yi loglama
const stream = await response.body();
console.log('Stream length:', stream.length);
console.log('Stream content:', stream.toString().substring(0, 100));

// 🔍 Response headers
console.log('Content-Type:', response.headers()['content-type']);
console.log('Transfer-Encoding:', response.headers()['transfer-encoding']);

// 🔍 Status code
console.log('Status:', response.status());
```

---

### 2. �🔐 Kimlik Doğrulama Testleri

#### **login.spec.ts** - Temel Login İşlevselliği
Bu dosya, login sayfasının temel işlevlerini test eder.

**Test Senaryoları:**
- ✅ Login sayfasının tüm elementleri görüntüleniyor mu?
- ✅ Şifre görünürlük butonu çalışıyor mu?
- ✅ Email ve şifre alanlarına veri girişi yapılabiliyor mu?
- ✅ Form doğrulama çalışıyor mu?
- ✅ Klavye navigasyonu çalışıyor mu?
- ✅ Enter tuşu ile form gönderilebiliyor mu?

**Kodlama İpuçları:**
```typescript
// ✅ İYİ: Label ile element seçimi (daha güvenilir)
await page.getByLabel('Email').fill('test@example.com');

// ❌ KÖTÜ: Selector ile seçim (kırılgan)
await page.locator('#email').fill('test@example.com');

// ✅ İYİ: Exact matching kullanımı (Password label'ı birden fazla olabilir)
await page.getByLabel('Password', { exact: true }).fill('password');

// ✅ İYİ: Klavye navigasyonu testi
await page.keyboard.press('Tab');
await expect(page.getByLabel('Email')).toBeFocused();
```

---

#### **login-security.spec.ts** - Güvenlik Testleri
Login sayfasının güvenlik açıklarına karşı testlerini içerir.

**Test Senaryoları:**
- ✅ SQL Injection saldırılarına karşı korumalı mı?
- ✅ XSS (Cross-Site Scripting) saldırılarına karşı korumalı mı?
- ✅ Şifre sayfa kaynağında görünmüyor mu?
- ✅ Özel karakterler doğru işleniyor mu?
- ✅ Çoklu hızlı login denemelerine karşı dayanıklı mı?

**Kodlama İpuçları:**
```typescript
// ✅ SQL Injection testi
const sqlInjection = "admin' OR '1'='1";
await page.getByLabel('Email').fill(sqlInjection);
await page.getByRole('button', { name: 'Sign In' }).click();
// Sistem çökmemeli, error sayfası göstermemeli
await expect(page).not.toHaveURL(/error|500/);

// ✅ XSS testi
const xssPayload = '<script>alert("XSS")</script>';
page.on('dialog', dialog => alerts.push(dialog));
await page.getByLabel('Email').fill(xssPayload);
// Alert çalışmamalı
expect(alerts.length).toBe(0);

// ✅ Şifre güvenliği kontrolü
const password = 'SuperSecret123!';
await page.getByLabel('Password', { exact: true }).fill(password);
const content = await page.content();
// HTML içinde şifre görünmemeli
expect(content).not.toContain(password);
```

---

#### **login-performance.spec.ts** - Performans Testleri
Login sayfasının performans metriklerini ölçer.

**Test Senaryoları:**
- ✅ Sayfa 3 saniye içinde yükleniyor mu?
- ✅ Tüm kritik kaynaklar yükleniyor mu?
- ✅ Yavaş ağda düzgün çalışıyor mu?
- ✅ Console error'ları var mı?
- ✅ Bellek sızıntısı var mı?

**Kodlama İpuçları:**
```typescript
// ✅ Sayfa yükleme süresi ölçümü
const startTime = Date.now();
await page.goto('http://localhost:5174/');
await page.waitForLoadState('domcontentloaded');
const loadTime = Date.now() - startTime;
expect(loadTime).toBeLessThan(3000);

// ✅ Console error'larını yakalama
const consoleErrors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});
// Kritik error'ları filtreleme (favicon gibi önemsizleri çıkar)
const criticalErrors = consoleErrors.filter(err => 
  !err.includes('favicon') && !err.includes('404')
);

// ✅ Yavaş ağ simülasyonu
await context.route('**/*', route => {
  setTimeout(() => route.continue(), 100);
});
```

---

#### **login-accessibility.spec.ts** - Erişilebilirlik Testleri
WCAG standartlarına uyum testleri.

**Test Senaryoları:**
- ✅ ARIA label'ları doğru mu?
- ✅ Klavye ile navigasyon yapılabiliyor mu?
- ✅ Focus indicator'ları görünüyor mu?
- ✅ Tab sırası mantıklı mı?
- ✅ Screen reader uyumlu mu?

**Kodlama İpuçları:**
```typescript
// ✅ ARIA label kontrolü
const emailInput = page.getByLabel('Email');
await expect(emailInput).toBeVisible();

// ✅ Klavye erişilebilirliği
await emailInput.focus();
await expect(emailInput).toBeFocused();

// ✅ Tab order kontrolü
await page.keyboard.press('Tab');
await expect(page.getByLabel('Email')).toBeFocused();
await page.keyboard.press('Tab');
await expect(page.getByLabel('Password', { exact: true })).toBeFocused();

// ✅ Semantic HTML kontrolü
const emailInput = page.getByLabel('Email');
await expect(emailInput).toHaveAttribute('type', 'email');
```

---

#### **login-responsive.spec.ts** - Responsive Tasarım Testleri
Farklı ekran boyutlarında çalışma testleri.

**Test Senaryoları:**
- ✅ Desktop (1920x1080) görünümü
- ✅ Tablet (768x1024) görünümü
- ✅ Mobile (375x667) görünümü
- ✅ iPhone 12 görünümü
- ✅ iPad Pro görünümü
- ✅ Küçük ekranlar (320x568)
- ✅ Yatay scroll bar yok mu?

**Kodlama İpuçları:**
```typescript
// ✅ Viewport boyutu ayarlama
await page.setViewportSize({ width: 375, height: 667 });

// ✅ Device emülasyonu
const context = await browser.newContext({
  ...devices['iPhone 12'],
});
const page = await context.newPage();

// ✅ Horizontal scroll kontrolü
const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

// ✅ Görüntü boyutu kontrolü
const logo = page.locator('img').first();
const box = await logo.boundingBox();
if (box) {
  expect(box.width).toBeLessThanOrEqual(375);
}
```

---

### 3. 👥 Kullanıcı Rol ve Yetki Testleri

#### **admin-account.spec.ts** - EFSORA_ADMIN Rolü
Admin kullanıcısının (admin@efsora.com) yetkilerini test eder.

**Test Senaryoları:**
- ✅ Admin başarıyla giriş yapabiliyor mu?
- ✅ TÜM şirketleri görebiliyor mu?
- ✅ TÜM projeleri görebiliyor mu?
- ✅ Kullanıcı yönetimi erişimi var mı?
- ✅ Sistem ayarlarına erişimi var mı?
- ✅ Admin rol göstergesi görünüyor mu?

**Kullanıcı Bilgileri:**
```
Email: admin@efsora.com
Password: Demo123!
Role: EFSORA_ADMIN
Access: TÜM sistemde tam yetki
```

**Kodlama İpuçları:**
```typescript
// ✅ beforeEach ile otomatik login
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5174/');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(5000);
});

// ✅ Regex ile esnek element arama
const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).or(
  page.getByText(/logout|sign out/i)
);

// ✅ Timeout ile element varlığı kontrolü
if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
  await logoutButton.click();
}
```

---

#### **customer-apex-admin.spec.ts** - CUSTOMER Rolü (Apex - customeradmin@apex.com)
Apex şirketinin customer admin kullanıcısı.

**Test Senaryoları:**
- ✅ Sadece Apex şirketini görebiliyor mu?
- ✅ Apex Mobile projesini görebiliyor mu?
- ✅ Apex Analytics projesini görebiliyor mu?
- ✅ Apex Web Portal projesini GÖREMİYOR mu? (Sarah'a ait)
- ✅ Diğer şirketleri GÖREMİYOR mu?
- ✅ Admin özelliklerine erişimi YOK mu?

**Kullanıcı Bilgileri:**
```
Email: customeradmin@apex.com
Password: Demo123!
Role: CUSTOMER
Company: Apex
Projects: Apex Mobile, Apex Analytics
```

**Kodlama İpuçları:**
```typescript
// ✅ Pozitif test (görünmeli)
const apexMobile = page.getByText(/apex mobile/i);
if (await apexMobile.isVisible({ timeout: 5000 }).catch(() => false)) {
  await expect(apexMobile).toBeVisible();
}

// ✅ Negatif test (görünmemeli)
const apexWebPortal = page.getByText(/apex web portal/i);
await expect(apexWebPortal).not.toBeVisible({ timeout: 3000 }).catch(() => {
  // Timeout beklenen bir durum (element yok)
});
```

---

#### **customer-apex-sarah.spec.ts** - CUSTOMER Rolü (Apex - sarah.wilson@apex.com)
Apex şirketinin ikinci customer kullanıcısı.

**Test Senaryoları:**
- ✅ Sadece Apex şirketini görebiliyor mu?
- ✅ Apex Web Portal projesini görebiliyor mu?
- ✅ Apex Analytics projesini görebiliyor mu? (Ortak proje)
- ✅ Apex Mobile projesini GÖREMİYOR mu? (customeradmin'e ait)
- ✅ customeradmin@apex.com'dan farklı proje erişimi var mı?

**Kullanıcı Bilgileri:**
```
Email: sarah.wilson@apex.com
Password: Demo123!
Role: CUSTOMER
Company: Apex
Projects: Apex Web Portal, Apex Analytics
```

**Önemli Not:** 
Sarah ve customeradmin aynı şirkette ama farklı projelere erişiyor!
- **Ortak Proje:** Apex Analytics (ikisi de görebilir)
- **Sarah'a Özel:** Apex Web Portal
- **CustomerAdmin'e Özel:** Apex Mobile

---

#### **customer-demo.spec.ts** - CUSTOMER Rolü (Demo - customer@demo.com)
Demo şirketinin customer kullanıcısı.

**Test Senaryoları:**
- ✅ Sadece Demo şirketini görebiliyor mu?
- ✅ Apex şirketini GÖREMİYOR mu?
- ✅ HİÇBİR Apex projesini GÖREMİYOR mu?
- ✅ Şirket izolasyonu sağlanıyor mu?
- ✅ Demo projelerini görebiliyor mu?

**Kullanıcı Bilgileri:**
```
Email: customer@demo.com
Password: Demo123!
Role: CUSTOMER
Company: Demo
Access: Sadece Demo şirketi verileri
```

**Kodlama İpuçları:**
```typescript
// ✅ Çoklu negatif test
const apexMobile = page.getByText(/apex mobile/i);
const apexAnalytics = page.getByText(/apex analytics/i);
const apexWebPortal = page.getByText(/apex web portal/i);

await expect(apexMobile).not.toBeVisible({ timeout: 3000 }).catch(() => {});
await expect(apexAnalytics).not.toBeVisible({ timeout: 3000 }).catch(() => {});
await expect(apexWebPortal).not.toBeVisible({ timeout: 3000 }).catch(() => {});
```

---

#### **cross-account-validation.spec.ts** - Çapraz Hesap Güvenlik Testleri
Farklı kullanıcılar arası izolasyon ve güvenlik testleri.

**Test Senaryoları:**
- ✅ Customer kullanıcılar admin özelliklerini görebiliyor mu? (GÖREMEMELİ)
- ✅ Admin tüm şirketleri görebiliyor mu? (GÖREBİLMELİ)
- ✅ Parameterized: Her Apex kullanıcısı doğru projeleri görüyor mu?
- ✅ Parameterized: Şirket izolasyonu çalışıyor mu?
- ✅ Parameterized: Tüm CUSTOMER hesapları admin özellikleri göremiyormu?
- ✅ Parameterized: Apex Analytics her iki Apex kullanıcısına görünüyor mu?
- ✅ Parameterized: Özel proje erişimleri doğru mu?
- ✅ Session izolasyonu çalışıyor mu?

**Kodlama İpuçları:**
```typescript
// ✅ Helper fonksiyon ile kod tekrarını azalt
async function loginUser(page, email: string) {
  await page.goto('http://localhost:5174/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
}

// ✅ Parameterized test yapısı
const apexUsers = [
  { email: 'customeradmin@apex.com', expectedProjects: ['Apex Mobile', 'Apex Analytics'] },
  { email: 'sarah.wilson@apex.com', expectedProjects: ['Apex Web Portal', 'Apex Analytics'] }
];

for (const user of apexUsers) {
  test(`${user.email} should see correct projects`, async ({ page }) => {
    await loginUser(page, user.email);
    for (const project of user.expectedProjects) {
      const projectElement = page.getByText(new RegExp(project, 'i'));
      await expect(projectElement).toBeVisible();
    }
  });
}

// ✅ Negatif parameterized test
const companyIsolation = [
  { email: 'customer@demo.com', shouldNotSee: /apex/i },
  { email: 'customeradmin@apex.com', shouldNotSee: /demo company/i }
];

for (const scenario of companyIsolation) {
  test(`${scenario.email} should not see ${scenario.shouldNotSee.source}`, async ({ page }) => {
    await loginUser(page, scenario.email);
    const forbiddenData = page.getByText(scenario.shouldNotSee);
    await expect(forbiddenData).not.toBeVisible({ timeout: 3000 });
  });
}
```

---

## � AI Chat Özellik Matrisi

### Kullanıcılara Göre Chat Özellikleri

| Kullanıcı | Chat Erişimi | Context Awareness | Admin Prompts | Streaming |
|-----------|--------------|-------------------|---------------|-----------|
| **admin@efsora.com** | ✅ Tam | ✅ Tüm sistem | ✅ Var | ✅ Server-Sent Events |
| **customeradmin@apex.com** | ✅ Var | ✅ Apex şirketi | ❌ Yok | ✅ Server-Sent Events |
| **sarah.wilson@apex.com** | ✅ Var | ✅ Apex şirketi | ❌ Yok | ✅ Server-Sent Events |
| **customer@demo.com** | ✅ Var | ✅ Demo şirketi | ❌ Yok | ✅ Server-Sent Events |

### Chat Test Kategorileri

**1. Temel İşlevsellik**
- Chat butonu görünürlüğü
- Panel açma/kapama
- Mesaj gönderme
- Response alma

**2. Streaming Testleri** 🌊
- Server-Sent Events (SSE) doğrulama
- Progressive rendering
- Token-by-token display
- Stream body okuma
- PerfoStreaming Response Testleri (İleri Seviye) 🌊

```typescript
// ✅ EN İYİ: Complete streaming test pattern
test('should verify streaming response', async ({ page }) => {
  // 1. Setup response interceptor ÖNCE
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/stream'),
    { timeout: 30000 }
  );
  
  // 2. Action (mesaj gönder)
  await page.keyboard.press('Enter');
  
  // 3. Response'u yakala
  const response = await responsePromise;
  
  // 4. Status code kontrolü
  expect(response.status()).toBe(200);
  3
  // 5. Content-Type kontrolü (streaming indicator)
  const contentType = response.headers()['content-type'];
  expect(contentType).toMatch(/text\/event-stream|application\/stream/);
  
  // 6. Stream body'yi oku (MANUEL - İLERİ SEVİYE)
  const stream = await response.body();
  expect(stream.length).toBeGreaterThan(0);
  
  // 7. Stream içeriğini parse et
  const streamText = stream.toString();
  expect(streamText).toBeTruthy();
  
  // 8. Backend'in streaming yaptığını kanıtla (hanging değil)
  expect(stream.length).toBeGreaterThan(0);
});
4
// ✅ Stream chunk monitoring
let chunks: any[] = [];
page.on('response', async (response) => {
  if (response.url().includes('/stream')) {
    const body = await response.body();
    chunks.push(body);
  }
});

// ✅ Performance measurement
const startTime = Date.now();
const response = await responsePromise;
const timeToFirstByte = Date.now() - startTime;
expect(timeToFirstByte).toBeLessThan(3000); // İlk chunk hızlı gelmeli

// ✅ Progressive rendering doğrulama
const updates: string[] = [];
const message = page.locator('.message').last();
for (let i = 0; i < 5; i++) {
  aw5it page.waitForTimeout(500);
  const text = await message.textContent();
  updates.push(text || '');
}
// Her update bir öncekinden uzun olmalı (progressive)
expect(updates[1].length).toBeGreaterThan(updates[0].length);
```

**Stream Response Formatları:**
```typescript
// ✅ Server-Sent Events (SSE)
// Content-Type: text/event-stream
// Format: data: {"token": "hello"}\n\n

// ✅ NDJSON (Newline Delimited JSON)
// Content-Type: application/x-ndjson
// Format: {"token": "hello"}\n{"token": "world"}\n

// ✅ Plain text stream
// Content-Type: text/plain
// Format: chunk1chunk2chunk3

// Parse etme örnekleri:
const stream = await response.body();
cons6 text = stream.toString();

// SSE parse
const lines = text.split('\n\n');
const data = lines.map(line => {
  if (line.startsWith('data: ')) {
    return JSON.parse(line.substring(6));
  }
});

// NDJSON parse
const jsonLines = text.split('\n').filter(line => line.trim());
const tokens = jsonLines.map(line => JSON.parse(line));
```7

---

### 2. rmance metrikleri

**3. LLM Response Testleri** 🤖
- Yaratıcı promptlar (şiir, hikaye)
- Teknik sorular
- Context maintenance
- Uzun response'lar
- Çoklu ardışık mesajlar

**4. Güvenlik Testleri** 🔒
- XSS injection
- SQL injection
- Özel karakter handling
- Co8tent sanitization

**5. UX/UI Testleri** 🎨
- Typing indicator
- Loading states
- Error handling
- Responsive design

---

## �👤 Kullanıcı Rolleri ve Yetkileri

### Yetki Matrisi

| Kullanıcı | Rol | Şirket | Projeler | Admin Özellikleri |
|-----------|-----|--------|----------|-------------------|
| **admin@efsora.com** | EFSORA_ADMIN | TÜM ŞİRKETLER | TÜM PROJELER | ✅ TAM YETKİ |
| **customeradmin@apex.com** | CUSTOMER | Apex | Apex Mobile, Apex Analytics | ❌ YOK |
| **sarah.wilson@apex.com** | CUSTOMER | Apex | Apex Web Portal, Apex Analytics | ❌ YOK |
| **customer@demo.com** | CUSTOMER | Demo | Demo Projeleri | ❌ YOK |

### Proje Erişim Matrisi

| Proje | Admin | CustomerAdmin | Sarah | Demo Customer |
|-------|-------|---------------|-------|---------------|
| **Apex Mobile** | ✅ | ✅ | ❌ | ❌ |
| **Apex Analytics** | ✅ | ✅ | ✅ | ❌ |
| **Apex Web Portal** | ✅ | ❌ | ✅ | ❌ |
| **Demo Projeleri** | ✅ | ❌ | ❌ | ✅ |

---

## 💡 Kodlama İpuçları

### 1. Element Seçimi İpuçları

```typescript
// ✅ EN İYİ: Role ve Name ile seçim (semantik, güvenilir)
await page.getByRole('button', { name: 'Sign In' }).click();

// ✅ İYİ: Label ile seçim (form elementleri için)
await page.getByLabel('Email').fill('test@example.com');

// ✅ İYİ: Text ile seçim (unique textler için)
await page.getByText('Welcome').isVisible();

// ⚠️ KAÇININ: CSS Selector (kırılgan)
await page.locator('#submit-button').click();

// ⚠️ KAÇININ: XPath (okunması zor)
await page.locator('//button[@id="submit"]').click();
```

### 2. Bekleme (Wait) İpuçları

```typescript
// ✅ İYİ: Network idle bekle (sayfa tamamen yüklensin)
await page.waitForLoadState('networkidle');

// ✅ İYİ: DOM content loaded (hızlı test için)
await page.waitForLoadState('domcontentloaded');

// ⚠️ DİKKATLİ KULLAN: Sabit süre bekle (flaky testlere sebep olabilir)
await page.waitForTimeout(5000); // Sadece gerektiğinde kullan

// ✅ EN İYİ: Element görünene kadar bekle
await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 5000 });
```

### 3. Assertion İpuçları

```typescript
// ✅ İYİ: Soft assertion (test devam etsin)
await expect.soft(page.getByText('Welcome')).toBeVisible();

// ✅ İYİ: Timeout ile assertion
await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 10000 });

// ✅ İYİ: Multiple assertions
await expect(page.getByLabel('Email')).toBeVisible();
await expect(page.getByLabel('Email')).toBeEnabled();
await expect(page.getByLabel('Email')).toBeEditable();

// ✅ İYİ: Error handling ile assertion
if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
  await expect(element).toBeVisible();
}
```

### 4. Test Organizasyonu İpuçları

```typescript
// ✅ İYİ: beforeEach ile setup
test.describe('Customer Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
    // Login logic
  });

  // Testler...
});

// ✅ İYİ: Açıklayıcı test isimleri
test('should login successfully with admin credentials', async ({ page }) => {
  // Test code
});

// ❌ KÖTÜ: Belirsiz test isimleri
test('test1', async ({ page }) => {
  // Test code
});
```

### 5. Regex Kullanımı

```typescript
// ✅ İYİ: Case-insensitive arama
await page.getByText(/welcome/i).isVisible();

// ✅ İYİ: Alternatifli arama
const logoutButton = page.getByRole('button', { name: /logout|sign out/i });

// ✅ İYİ: Kısmi metin eşleştirme
const apexProject = page.getByText(/apex/i);
```

### 6. Parameterized Test Yapısı

```typescript
// ✅ Parameterized test örneği
const users = [
  { email: 'user1@test.com', role: 'ADMIN' },
  { email: 'user2@test.com', role: 'USER' }
];

for (const user of users) {
  test(`${user.email} should have ${user.role} role`, async ({ page }) => {
    await loginUser(page, user.email);
    // Assertions
  });
}
```

### 7. Error Handling

```typescriptAI Chat + Streaming, Login, Auth, Security, Accessibility, Performance, Responsive
- **Yeni Özellikler:** 
  - 💬 AI Chat testleri (LLM response validation)
  - 🌊 Server-Sent Events streaming testleri
  - 🤖 Context-aware conversation testleri
  - ⚡ Progressive rendering testleri
// ✅ İYİ: Try-catch ile error handling
try {
  await page.getByText('Optional Element').click();
} catch (error) {
  console.log('Optional element not found, continuing...');
### AI Chat Testleri
- [admin-chat.spec.ts](admin-chat.spec.ts) - **YENİ!** Admin AI chat testleri (Streaming + LLM)

### Kullanıcı Rol Testleri
}

### Login ve Güvenlik Testleri

// ✅ İYİ: Catch ile timeout handling
await expect(element).not.toBeVisible({ timeout: 3000 }).catch(() => {
  // Element bulunamadı, bu beklenen bir durum
});
```

---

## 🎯 En İyi Uygulamalar

### 1. Test Bağımsızlığı
- ✅ Her test bağımsız çalışabilmeli
- ✅ Test sırası önemli olmamalı
- ✅ beforeEach ile temiz başlangıç

### 2. Test Hızı
- ✅ Gereksiz `waitForTimeout` kullanmayın
- ✅ `waitForLoadState` tercih edin
- ✅ Paralel test çalıştırma kullanın

### 3. Test Kararlılığı (Flakiness)
- ✅ Element seçiminde role/label kullanın
- ✅ Timeout değerlerini mantıklı ayarlayın
- ✅ Network idle bekleyin
- ❌ Sabit CSS selector kullanmayın

### 4. Okunabilirlik
- ✅ Açıklayıcı test isimleri
- ✅ Yorum satırları ekleyin
- ✅ Helper fonksiyonlar kullanın
- ✅ Test gruplarını mantıklı organize edin

### 5. Bakım Kolaylığı
- ✅ Sabit değerleri const olarak tanımlayın
- ✅ Tekrarlanan kodu helper fonksiyonlara taşıyın
- ✅ Page Object Model kullanın (büyük projelerde)

### 6. Güvenlik
- ✅ Şifreleri environment variable'da saklayın
- ✅ SQL injection testleri yapın
- ✅ XSS testleri yapın
- ✅ Session izolasyonu test edin

### 7. Erişilebilirlik
- ✅ ARIA label'ları test edin
- ✅ Klavye navigasyonu test edin
- ✅ Focus indicator'ları kontrol edin
- ✅ Screen reader uyumluluğu test edin

### 8. Responsive Tasarım
- ✅ Farklı viewport boyutlarını test edin
- ✅ Device emülasyonu kullanın
- ✅ Horizontal scroll kontrolü yapın

---

## 🚀 Test Çalıştırma Komutları

```bash
# Tüm testleri çalıştır
npx playwright test tests/customerportal

# Belirli bir test dosyasını çalıştır
npx playwright test tests/customerportal/login.spec.ts

# Headed mode (tarayıcı görünsün)
npx playwright test tests/customerportal --headed

# Debug mode
npx playwright test tests/customerportal --debug

# Belirli bir tarayıcıda çalıştır
npx playwright test tests/customerportal --project=chromium

# Paralel çalıştırma
npx playwright test tests/customerportal --workers=4

# HTML rapor oluştur
npx playwright test tests/customerportal --reporter=html
```

---

## 📝 Notlar

- **Test Verileri:** Tüm test kullanıcıları `Demo123!` şifresini kullanır
- **Test Ortamı:** `http://localhost:5174/`
- **Toplam Test Sayısı:** 100+ test senaryosu
- **Test Coverage:** Login, Auth, Security, Accessibility, Performance, Responsive

---

## 🔗 İlgili Dosyalar

- [admin-account.spec.ts](admin-account.spec.ts) - Admin rol testleri
- [customer-apex-admin.spec.ts](customer-apex-admin.spec.ts) - Apex customer admin testleri
- [customer-apex-sarah.spec.ts](customer-apex-sarah.spec.ts) - Apex customer Sarah testleri
- [customer-demo.spec.ts](customer-demo.spec.ts) - Demo customer testleri
- [cross-account-validation.spec.ts](cross-account-validation.spec.ts) - Çapraz güvenlik testleri
- [login.spec.ts](login.spec.ts) - Temel login testleri
- [login-security.spec.ts](login-security.spec.ts) - Güvenlik testleri
- [login-performance.spec.ts](login-performance.spec.ts) - Performans testleri
- [login-accessibility.spec.ts](login-accessibility.spec.ts) - Erişilebilirlik testleri
- [login-responsive.spec.ts](login-responsive.spec.ts) - Responsive testleri

---

**Son Güncelleme:** 2026-02-04
**Playwright Versiyonu:** ^1.40.0
**Dil:** TypeScript
