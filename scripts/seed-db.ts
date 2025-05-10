import { db } from "../server/db";
import { services, memberships } from "../shared/schema";

async function seed() {
  console.log("Seeding database with initial data...");

  // Add services
  const servicesData = [
    {
      slug: "laser-hair-removal",
      category: "beauty",
      name: { 
        en: "Laser Hair Removal", 
        ar: "إزالة الشعر بالليزر", 
        de: "Laser-Haarentfernung", 
        tr: "Lazer Epilasyon" 
      },
      description: { 
        en: "Permanent hair reduction with advanced laser technology", 
        ar: "تقليل الشعر الدائم باستخدام تقنية الليزر المتقدمة", 
        de: "Dauerhafte Haarreduktion mit fortschrittlicher Lasertechnologie", 
        tr: "Gelişmiş lazer teknolojisiyle kalıcı tüy azaltma" 
      },
      longDescription: { 
        en: "Our state-of-the-art laser hair removal treatments provide lasting results with minimal discomfort. Safe for all skin types.", 
        ar: "توفر علاجات إزالة الشعر بالليزر المتطورة لدينا نتائج دائمة مع الحد الأدنى من الانزعاج. آمنة لجميع أنواع البشرة.", 
        de: "Unsere hochmoderne Laser-Haarentfernungsbehandlungen bieten dauerhafte Ergebnisse mit minimalem Unbehagen. Sicher für alle Hauttypen.", 
        tr: "Son teknoloji lazer epilasyon tedavilerimiz, minimum rahatsızlıkla kalıcı sonuçlar sağlar. Tüm cilt tipleri için güvenlidir." 
      },
      duration: 60,
      price: 500,
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      imageLarge: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80",
      benefits: [
        { en: "Long-lasting results", ar: "نتائج طويلة الأمد", de: "Langanhaltende Ergebnisse", tr: "Uzun süreli sonuçlar" },
        { en: "Quick treatments", ar: "علاجات سريعة", de: "Schnelle Behandlungen", tr: "Hızlı tedaviler" },
        { en: "Minimal discomfort", ar: "الحد الأدنى من الانزعاج", de: "Minimales Unbehagen", tr: "Minimum rahatsızlık" }
      ],
      includes: [
        { en: "Consultation", ar: "استشارة", de: "Beratung", tr: "Danışma" },
        { en: "Aftercare products", ar: "منتجات العناية بعد العلاج", de: "Nachsorgeprodukten", tr: "Bakım ürünleri" }
      ]
    },
    {
      slug: "facial-treatments",
      category: "skincare",
      name: { 
        en: "Premium Facial Treatment", 
        ar: "علاج الوجه المميز", 
        de: "Premium Gesichtsbehandlung", 
        tr: "Premium Yüz Bakımı" 
      },
      description: { 
        en: "Rejuvenate your skin with our premium facial treatments", 
        ar: "جددي بشرتك مع علاجات الوجه المميزة لدينا", 
        de: "Revitalisieren Sie Ihre Haut mit unseren Premium-Gesichtsbehandlungen", 
        tr: "Premium yüz bakımlarımızla cildinizi canlandırın" 
      },
      longDescription: { 
        en: "Experience the ultimate in facial luxury with our premium treatments using high-end products and advanced techniques for glowing skin.", 
        ar: "جربي أقصى درجات الفخامة للوجه مع علاجاتنا المميزة باستخدام منتجات راقية وتقنيات متقدمة للحصول على بشرة متوهجة.", 
        de: "Erleben Sie den ultimativen Gesichtsluxus mit unseren Premium-Behandlungen, die hochwertige Produkte und fortschrittliche Techniken für strahlende Haut verwenden.", 
        tr: "Yüksek kaliteli ürünler ve parlak bir cilt için gelişmiş teknikler kullanan premium tedavilerimizle yüz bakımında en üst düzey lüksü yaşayın." 
      },
      duration: 90,
      price: 750,
      imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      imageLarge: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80",
      benefits: [
        { en: "Deep cleansing", ar: "تنظيف عميق", de: "Tiefenreinigung", tr: "Derin temizlik" },
        { en: "Anti-aging benefits", ar: "فوائد مكافحة الشيخوخة", de: "Anti-Aging-Vorteile", tr: "Yaşlanma karşıtı faydalar" },
        { en: "Improved skin texture", ar: "تحسين نسيج البشرة", de: "Verbesserte Hauttextur", tr: "Geliştirilmiş cilt dokusu" }
      ],
      includes: [
        { en: "Skin analysis", ar: "تحليل البشرة", de: "Hautanalyse", tr: "Cilt analizi" },
        { en: "Customized mask", ar: "قناع مخصص", de: "Angepasste Maske", tr: "Özelleştirilmiş maske" },
        { en: "Relaxing massage", ar: "تدليك مريح", de: "Entspannende Massage", tr: "Rahatlatıcı masaj" }
      ]
    },
    {
      slug: "skin-tightening",
      category: "skincare",
      name: { 
        en: "Advanced Skin Tightening", 
        ar: "شد البشرة المتقدم", 
        de: "Fortgeschrittene Hautstraffung", 
        tr: "Gelişmiş Cilt Sıkılaştırma" 
      },
      description: { 
        en: "Non-invasive skin tightening with immediate visible results", 
        ar: "شد البشرة غير الجراحي مع نتائج مرئية فورية", 
        de: "Nicht-invasive Hautstraffung mit sofort sichtbaren Ergebnissen", 
        tr: "Anında görünür sonuçlarla invaziv olmayan cilt sıkılaştırma" 
      },
      longDescription: { 
        en: "Our advanced skin tightening treatment uses radio frequency technology to firm and tone your skin without surgery or downtime.", 
        ar: "يستخدم علاج شد البشرة المتقدم لدينا تقنية الترددات الراديوية لشد بشرتك وتحسين مظهرها دون جراحة أو وقت تعافي.", 
        de: "Unsere fortschrittliche Hautstraffungsbehandlung nutzt Radiofrequenztechnologie, um Ihre Haut ohne Operation oder Ausfallzeit zu straffen und zu straffen.", 
        tr: "Gelişmiş cilt sıkılaştırma tedavimiz, ameliyat veya iyileşme süresi olmadan cildinizi sıkılaştırmak ve tonlamak için radyo frekansı teknolojisini kullanır." 
      },
      duration: 75,
      price: 900,
      imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      imageLarge: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80",
      benefits: [
        { en: "Non-invasive", ar: "غير جراحي", de: "Nicht-invasiv", tr: "İnvaziv olmayan" },
        { en: "Instant results", ar: "نتائج فورية", de: "Sofortige Ergebnisse", tr: "Anında sonuçlar" },
        { en: "No recovery time", ar: "لا وقت للتعافي", de: "Keine Erholungszeit", tr: "İyileşme süresi yok" }
      ],
      includes: [
        { en: "Consultation", ar: "استشارة", de: "Beratung", tr: "Danışma" },
        { en: "Cooling treatment", ar: "علاج التبريد", de: "Kühlbehandlung", tr: "Soğutma tedavisi" }
      ]
    },
    {
      slug: "hair-services",
      category: "beauty",
      name: { 
        en: "Luxury Hair Styling", 
        ar: "تصفيف الشعر الفاخر", 
        de: "Luxuriöses Haarstyling", 
        tr: "Lüks Saç Şekillendirme" 
      },
      description: { 
        en: "Complete hair makeover by our master stylists", 
        ar: "تغيير كامل للشعر بواسطة مصففي الشعر الرئيسيين لدينا", 
        de: "Komplettes Haar-Makeover von unseren Meisterstylisten", 
        tr: "Usta stilistlerimiz tarafından komple saç değişimi" 
      },
      longDescription: { 
        en: "Indulge in our luxury hair styling services, tailored to your unique style and personality. Our master stylists use only premium products.", 
        ar: "استمتعي بخدمات تصفيف الشعر الفاخرة لدينا، والمصممة خصيصًا لأسلوبك وشخصيتك الفريدة. يستخدم مصففي الشعر الرئيسيين لدينا منتجات متميزة فقط.", 
        de: "Gönnen Sie sich unsere luxuriösen Haarstyling-Services, die auf Ihren einzigartigen Stil und Ihre Persönlichkeit zugeschnitten sind. Unsere Meisterstylisten verwenden nur Premium-Produkte.", 
        tr: "Benzersiz stilinize ve kişiliğinize göre özel olarak tasarlanmış lüks saç şekillendirme hizmetlerimizin keyfini çıkarın. Usta stilistlerimiz sadece premium ürünler kullanır." 
      },
      duration: 120,
      price: 600,
      imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      imageLarge: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80",
      benefits: [
        { en: "Personalized style", ar: "أسلوب مخصص", de: "Personalisierter Stil", tr: "Kişiselleştirilmiş stil" },
        { en: "Premium products", ar: "منتجات متميزة", de: "Premium-Produkte", tr: "Premium ürünler" },
        { en: "Expert advice", ar: "نصائح الخبراء", de: "Expertenberatung", tr: "Uzman tavsiyesi" }
      ],
      includes: [
        { en: "Consultation", ar: "استشارة", de: "Beratung", tr: "Danışma" },
        { en: "Washing and conditioning", ar: "الغسيل والبلسم", de: "Waschen und Pflegen", tr: "Yıkama ve bakım" },
        { en: "Styling", ar: "تصفيف", de: "Styling", tr: "Şekillendirme" }
      ]
    }
  ];

  // Add memberships
  const membershipsData = [
    {
      membershipNumber: "GOLD0001",
      name: "Gold Membership",
      discount: 30,
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      memberName: "Fatima Al-Maktoum",
      email: "fatima@example.com",
      phone: "+971 50 123 4567"
    },
    {
      membershipNumber: "SILV0001",
      name: "Silver Membership",
      discount: 15,
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      memberName: "Aisha Rahman",
      email: "aisha@example.com",
      phone: "+971 55 987 6543"
    }
  ];

  // Insert services
  await db.insert(services).values(servicesData);
  console.log("Services added successfully!");

  // Insert memberships
  await db.insert(memberships).values(membershipsData);
  console.log("Memberships added successfully!");

  console.log("Database seeding completed!");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
}).finally(() => {
  process.exit(0);
});