# Yormio SEO, AEO ve arama keşfedilebilirliği incelemesi

İnceleme tarihi: 15 Kasım 2026. Hedef: https://yormio-app.netlify.app/

Bu çalışma mevcut landing page deposunda yapıldı. Commit, push veya deploy
**yapılmadı**. Yeni bağımlılık eklenmedi. Mobil uygulama, mağaza metinleri,
fiyatlandırma ve abonelik davranışı değiştirilmedi.

## Mevcut yapı ve canlı başlangıç durumu

- Framework, paket yöneticisi, `package.json`, build veya lint komutu yok.
  Semantik HTML, CSS ve tarayıcı JavaScript'i kullanılıyor.
- Netlify `publish = "."` ile proje kökünü yayınlıyor.
- Ana ürün sayfası `index.html`; `/share` ve `/share/`, Netlify 200 rewrite ile
  `share/index.html` dosyasına gidiyor. SPA/router veya sunucu uygulaması yok.
- `config.js` mağaza ve yasal/destek bağlantılarını merkezi olarak tanımlıyor.
- `script.js` menü, reveal animasyonları, video ve ekran görüntüsü filtrelerini
  yönetiyor. `share/share.js` EN/TR/DE/SV yerelleştirmesi ve fragment tabanlı
  uygulama bağlantısını yönetiyor.
- Kodda robots.txt, sitemap, canonical, JSON-LD veya hreflang bulunmuyordu.
  Google site doğrulama etiketi zaten vardı ve korundu.
- Salt okunur canlı HTTP kontrolünde `/` ve `/share` 200; `/robots.txt` ve
  `/sitemap.xml` 404 döndü. Ana sayfada canonical veya robots meta etiketi,
  kontrol edilen yanıtlarda `X-Robots-Tag` yoktu. Dolayısıyla canlı robots
  dosyasında korunması gereken bir GPTBot kuralı da bulunamadı.
- App Store adresi 200 döndü ve Yormio kaydı doğrulandı. Google Play kaydı resmi
  sayfadan okunabildi. Puan, değerlendirme veya indirme sayısı kullanılmadı.

## Tamamlanan kod değişiklikleri

| Dosya | Değişiklik |
| --- | --- |
| `robots.txt` | Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot ve Claude-User için açık erişim; sitemap adresi. Diğer botların önceki kısıtlanmamış varsayılan erişimi korundu. GPTBot için yeni izin/engel kuralı eklenmedi. |
| `sitemap.xml` | Yalnızca gerçekten var olan, indekslenmesi amaçlanan canonical ana sayfa. Fragment, `/share`, `/index.html` kopyası, harici hukuk sayfaları ve hayali çeviri URL'leri yok. Doğrulanmamış lastmod kullanılmadı. |
| `index.html` | Tekil title/description, canonical, OG URL/site adı/görsel boyutları/alt metni ve Twitter metadata; gerçek mağaza adresleriyle MobileApplication JSON-LD. |
| `index.html` | Statik HTML içinde çoklu sesli hatırlatıcı, kaydetmeden önce inceleme/onay, alışveriş checklist'i, bağımsız kopya paylaşımı ve Premium metin/yapıştırma açıklamaları. Altı görünür soru-cevap eklendi. |
| `index.html` | Mağaza ve yasal/destek bağlantıları ilk HTML'de gerçek href içeriyor. JavaScript çalışmadan da erişilebilir. Google doğrulama etiketi korundu. |
| `index.html`, `styles.css` | Ana içeriğe atlama bağlantısı, klavye odak göstergeleri, gerçek görsel boyutları, async decode, ana görselde yüksek indirme önceliği; alt bölüm görsellerinde lazy loading. Video preload `none` oldu. |
| `script.js`, `styles.css` | Reveal animasyonları korunarak JavaScript yokken içeriğin görünür kalması sağlandı. Mobil menü için JS'siz navigasyon, Escape ile kapanma ve durum etiketi; filtrelerde aria-pressed. |
| `share/index.html`, `netlify.toml` | `/share` yardımcı sayfası meta ve HTTP başlığıyla `noindex, follow`. Botların noindex'i okuyabilmesi için robots ile engellenmiyor. Token davranışı ve güvenlik politikaları korundu. |
| `netlify.toml` | `/index.html` için canonical `/` adresine 301 tanımı. Netlify üzerindeki gerçek yönlendirme davranışı deploy sonrası doğrulanmalı. |
| `tests/seo_check.py` | Bağımlılıksız metadata, schema, robots, sitemap, kaynak/bağlantı, görsel ve noindex kontrolleri. |
| `tests/landing.test.cjs` | Menü, filtrelerin erişilebilirlik durumu, reveal ve mağaza bağlantısı regresyon testleri. |
| `README.md`, `SEO-REVIEW.md` | Kontrol komutları, kapsam, bulgular ve yayın sonrası işler. |

Schema.org `MobileApplication`, `SoftwareApplication` alt türüdür. İki resmi
mağaza için `offers.price: 0` yalnızca **ücretsiz indirmeyi** ifade eder;
açıklamalar isteğe bağlı Premium özelliklerini açıkça ayırır. Abonelik ücreti,
para birimi, minimum işletim sistemi sürümü veya doğrulanmamış değerlendirme
eklenmedi. Google uygulama rich result uygunluğu için değerlendirme/puan da
ister; bunlar olmadığı için bu JSON-LD'nin rich result testinde tam uygunluk
sağladığı iddia edilmiyor. Geçerli veri ile rich result uygunluğu farklıdır.

`llms.txt` eklenmedi. Bu tek sayfalı ürün sitesi için doğrulanmış bir tüketici
veya pratik belge keşif ihtiyacı bulunmadı; Google AI özellikleri özel bir AI
metin dosyası gerektirmiyor. FAQPage işaretlemesi veya görünürlük garantisi de
eklenmedi.

## Çok dilli SEO

- Ana ürün sayfası İngilizce ve `lang="en"` kullanıyor.
- Mobil uygulamanın EN/TR/SV/DE desteği, ana sayfada bu dillerde ürün sayfaları
  bulunduğu anlamına gelmez.
- `/share` tarayıcı tercihlerine göre istemci tarafında dört dilde çalışıyor;
  bu bir ürün keşif sayfası değil ve ayrı, indekslenebilir dil URL'leri yok.
- Sahte hreflang, og:locale:alternate veya `/tr/`, `/sv/`, `/de/` URL'leri
  eklenmedi. Gerçek çeviriler ileride hazırlanırsa ayrı statik URL'ler,
  kendi canonical'ları ve karşılıklı hreflang ile uygulanabilir.

## Yapılan kontroller ve sınırlar

```bash
node --test tests/*.test.cjs
python3 tests/seo_check.py
node --check script.js
node --check config.js
node --check share/share.js
git diff --check
```

- 17 JavaScript testi ve 5 SEO kontrolü geçti.
- JS testleri simüle DOM üzerinde çalışır. EN/TR/DE/SV, dil tercih sırası,
  bölgesel kodlar, EN fallback, geçersiz bağlantılar, token/mağaza davranışı,
  menü, filtreler ve animasyonun observer fallback'i kapsanır.
- SEO kontrolleri HTMLParser, JSON, XML ve robots ayrıştırıcıları kullanır.
  Tekil SEO etiketleri, gerçek dosyalar, görsel boyutları, iç bağlantı hedefleri,
  mağaza/config/schema tutarlılığı ve noindex kontrol edildi.
- Geçici localhost sunucusunda `/`, `/robots.txt`, `/sitemap.xml`, `/share/`,
  `/share/share.js`, `/styles.css`, `/script.js` 200 döndü. Robots `text/plain`,
  sitemap `application/xml` döndü. Bu sunucu Netlify kurallarını uygulamaz.
- CSS'in 1100/820/540px kırılımları, tek sütuna inen FAQ/özellik alanları,
  görsel ölçekleme ve reduced-motion kuralları kod üzerinden kontrol edildi.
- Tarayıcı bağlantısı mevcut değildi ve native Chrome aracı başlatılamadı.
  Bu nedenle gerçek mobil/masaüstü görsel kontrolü, Lighthouse, ekran okuyucu,
  renk kontrastı veya Core Web Vitals ölçümü tamamlandı denmiyor.
- Rich Results Test, Schema.org Validator ve Search Console canlı URL testi
  dış hizmetlerde çalıştırılmadı; yerel doğrulama bunların yerine geçmez.

## Açık performans ve erişilebilirlik işleri

- On ekran görüntüsü toplam yaklaşık 21 MiB; tekil PNG'ler yaklaşık 1–3.5 MiB.
  Lazy loading mevcut ama toplam aktarım ve hızlı kaydırmada yük devam ediyor.
  Sonraki adım, orijinalleri koruyan WebP/AVIF ve responsive srcset türevleri
  üretip ekran görüntüsü karşılaştırmasıyla kaliteyi doğrulamak olabilir.
- Ana görsel yaklaşık 1.7 MiB; video yaklaşık 13 MiB. Video otomatik oynamıyor
  ve artık ilk yüklemede metadata istemiyor. Gerçek LCP/CLS/INP ölçümü gerekli.
- Google Fonts dış kaynağı ve mevcut font görünümü korundu. Font alt kümesi veya
  self-hosting ancak ölçümden sonra değerlendirilmeli.
- Video için doğrulanmış altyazı/transkript dosyası yok. Kayıtla karşılaştırılarak
  hazırlanmalı; videoya ait sahte transkript veya izlenmemiş içerik iddiası yok.
- Uzun hareketli ticker ve gerçek klavye/ekran okuyucu kullanımının tam
  erişilebilirlik değerlendirmesi sonraki tarayıcı kontrolüne dahil edilmeli.

## Yararlı içerik fırsatları

Aşağıdaki öneriler arama hacmi veya sıralama iddiası değildir. Mevcut sayfadaki
özellik ve soru-cevap alanları bu niyetleri kısa ve görünür biçimde karşılıyor.
Ayrı içerik ancak örnekleri ve yeterli özgün açıklaması hazırlanırsa yayınlanmalı;
ayrı anahtar kelimeler için birbirine benzeyen ince sayfalar oluşturulmamalı.

| Arama niyeti | Yararlı bir sonraki içerik |
| --- | --- |
| AI voice reminder app | iOS/Android üzerinde ses kaydı → AI önerisi → kullanıcı onayı akışını gösteren gerçek kullanım kılavuzu. |
| Create multiple reminders by voice | Bir kayıtta birkaç görev örneği, çıkan önerilerin ekran görüntüsü ve kaydetmeden önce inceleme açıklaması. |
| Voice to-do list app | Sesli checklist ile tarihli hatırlatıcının farkı; alışveriş ve günlük işler örnekleri. |
| AI shopping checklist | Konuşmadan alışveriş listesi oluşturma ve bağımsız kopya paylaşımının adım adım açıklaması. Canlı ortak liste sözü verilmemeli. |
| Paste text into reminders | Premium gereksinimini başta belirten, kişisel veri içermeyen örnek metin ve AI sonuçlarını inceleme kılavuzu. |

## Dış servislerde veya yayın sonrasında yapılacaklar

Bu işler kodda tamamlanmış değildir ve bu çalışma kapsamında hesaplarda işlem
yapılmadı. Yapılan kod değişiklikleri için ek onay gerekmiyor.

1. Kullanıcının ayrıca yayın talimatından sonra Netlify'da mevcut siteyi
   güncellemek. Build komutu yok; publish dizini `.`. Bu çalışmada yayın yasak.
2. Canlı `/robots.txt` ve `/sitemap.xml` için 200 ve doğru MIME türlerini,
   `/index.html` → `/` için 301'i, ana sayfanın indekslenebilirliğini ve
   `/share`, `/share/`, `/share/index.html` noindex başlıklarını doğrulamak.
3. Google Search Console'da mevcut HTML doğrulama etiketiyle mülkiyeti
   doğrulamak, `https://yormio-app.netlify.app/sitemap.xml` adresini göndermek,
   ana sayfayı URL Inspection ile kontrol etmek ve gerekiyorsa indeksleme
   istemek. Meta etiketin varlığı hesabın doğrulandığını göstermez.
4. Bing Webmaster Tools'ta siteyi doğrulamak veya uygun Search Console
   mülkiyetini içe aktarmak; aynı sitemap'i göndermek ve URL/robots kontrolü
   yapmak. Bing doğrulaması için gereken anahtar/hesap erişimi henüz yok.
5. Schema.org Validator ve Google Rich Results Test ile yayınlanan işaretlemeyi
   kontrol etmek. Puan eksikliğini uydurma veriyle kapatmamak.
6. Netlify/CDN veya başka bir koruma katmanının gerçek Googlebot, Bingbot ve
   OAI-SearchBot isteklerini engellemediğini loglar üzerinden kontrol etmek.
   Kodda bot erişimine izin verilmesi altyapı engelinin olmadığını kanıtlamaz.
7. Gerçek mobil cihazda ve masaüstünde görsel/klavye testi; PageSpeed Insights
   ve yeterli trafik varsa Search Console Core Web Vitals değerlendirmesi.
8. Sonuçları indekslenme, organik sorgu/gösterim/tıklamalar ve mevcutsa AI
   yönlendirmeleri üzerinden izlemek. Hiçbir motor için sıralama veya AI
   yanıtında görünme garantisi verilemez.

Yeni dil sayfaları, video altyazıları veya ayrı kullanım kılavuzları içerik
hazırlığı ve ek kapsam kararı gerektirir. GPTBot eğitim tercihi değiştirilmedi;
ileride değişiklik istenirse açık kullanıcı kararı alınmalı.

## Resmi kaynaklar

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: SoftwareApplication structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Schema.org: MobileApplication](https://schema.org/MobileApplication)
- [Google: Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [OpenAI: Crawlers, OAI-SearchBot ve GPTBot ayrımı](https://developers.openai.com/api/docs/bots)
- [Anthropic: Web crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Bing: robots.txt](https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec)
