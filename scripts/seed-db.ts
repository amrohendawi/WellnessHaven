import { db } from "../server/db";
import { services, memberships } from "../shared/schema";

async function seed() {
  console.log("Seeding database with initial data...");

  // Add services
  const servicesData = [
    {
      slug: "laser-hair-removal",
      category: "beauty",
      nameEn: "Laser Hair Removal",
      nameAr: "إزالة الشعر بالليزر",
      nameDe: "Laser-Haarentfernung",
      nameTr: "Lazer Epilasyon",
      descriptionEn: "Permanent hair reduction with advanced laser technology",
      descriptionAr: "تقليل الشعر الدائم باستخدام تقنية الليزر المتقدمة",
      descriptionDe: "Dauerhafte Haarreduktion mit fortschrittlicher Lasertechnologie",
      descriptionTr: "Gelişmiş lazer teknolojisiyle kalıcı tüy azaltma",
      longDescriptionEn: "Our state-of-the-art laser hair removal treatments provide lasting results with minimal discomfort. Safe for all skin types.",
      longDescriptionAr: "توفر علاجات إزالة الشعر بالليزر المتطورة لدينا نتائج دائمة مع الحد الأدنى من الانزعاج. آمنة لجميع أنواع البشرة.",
      longDescriptionDe: "Unsere hochmoderne Laser-Haarentfernungsbehandlungen bieten dauerhafte Ergebnisse mit minimalem Unbehagen. Sicher für alle Hauttypen.",
      longDescriptionTr: "Son teknoloji lazer epilasyon tedavilerimiz, minimum rahatsızlıkla kalıcı sonuçlar sağlar. Tüm cilt tipleri için güvenlidir.",
      duration: 60,
      price: 500,
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      imageLarge: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80",
      isActive: true
    },
    {
      slug: "facial-treatments",
      category: "skincare",
      nameEn: "Premium Facial Treatment",
      nameAr: "علاج الوجه المميز",
      nameDe: "Premium Gesichtsbehandlung",
      nameTr: "Premium Yüz Bakımı",
      descriptionEn: "Rejuvenate your skin with our premium facial treatments",
      descriptionAr: "جددي بشرتك مع علاجات الوجه المميزة لدينا",
      descriptionDe: "Revitalisieren Sie Ihre Haut mit unseren Premium-Gesichtsbehandlungen",
      descriptionTr: "Premium yüz bakımlarımızla cildinizi canlandırın",
      longDescriptionEn: "Experience the ultimate in facial luxury with our premium treatments using high-end products and advanced techniques for glowing skin.",
      longDescriptionAr: "جربي أقصى درجات الفخامة للوجه مع علاجاتنا المميزة باستخدام منتجات راقية وتقنيات متقدمة للحصول على بشرة متوهجة.",
      longDescriptionDe: "Erleben Sie den ultimativen Gesichtsluxus mit unseren Premium-Behandlungen, die hochwertige Produkte und fortschrittliche Techniken für strahlende Haut verwenden.",
      longDescriptionTr: "Yüksek kaliteli ürünler ve parlak bir cilt için gelişmiş teknikler kullanan premium tedavilerimizle yüz bakımında en üst düzey lüksü yaşayın.",
      duration: 90,
      price: 750,
      imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      imageLarge: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80",
      isActive: true
    },
    {
      slug: "skin-tightening",
      category: "skincare",
      nameEn: "Advanced Skin Tightening",
      nameAr: "شد البشرة المتقدم",
      nameDe: "Fortgeschrittene Hautstraffung",
      nameTr: "Gelişmiş Cilt Sıkılaştırma",
      descriptionEn: "Non-invasive skin tightening with immediate visible results",
      descriptionAr: "شد البشرة غير الجراحي مع نتائج مرئية فورية",
      descriptionDe: "Nicht-invasive Hautstraffung mit sofort sichtbaren Ergebnissen",
      descriptionTr: "Anında görünür sonuçlarla invaziv olmayan cilt sıkılaştırma",
      longDescriptionEn: "Our advanced skin tightening treatment uses radio frequency technology to firm and tone your skin without surgery or downtime.",
      longDescriptionAr: "يستخدم علاج شد البشرة المتقدم لدينا تقنية الترددات الراديوية لشد بشرتك وتحسين مظهرها دون جراحة أو وقت تعافي.",
      longDescriptionDe: "Unsere fortschrittliche Hautstraffungsbehandlung nutzt Radiofrequenztechnologie, um Ihre Haut ohne Operation oder Ausfallzeit zu straffen und zu straffen.",
      longDescriptionTr: "Gelişmiş cilt sıkılaştırma tedavimiz, ameliyat veya iyileşme süresi olmadan cildinizi sıkılaştırmak ve tonlamak için radyo frekansı teknolojisini kullanır.",
      duration: 75,
      price: 900,
      imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      imageLarge: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80",
      isActive: true
    },
    {
      slug: "hair-services",
      category: "beauty",
      nameEn: "Luxury Hair Styling",
      nameAr: "تصفيف الشعر الفاخر",
      nameDe: "Luxuriöses Haarstyling",
      nameTr: "Lüks Saç Şekillendirme",
      descriptionEn: "Complete hair makeover by our master stylists",
      descriptionAr: "تغيير كامل للشعر بواسطة مصففي الشعر الرئيسيين لدينا",
      descriptionDe: "Komplettes Haar-Makeover von unseren Meisterstylisten",
      descriptionTr: "Usta stilistlerimiz tarafından komple saç değişimi",
      longDescriptionEn: "Indulge in our luxury hair styling services, tailored to your unique style and personality. Our master stylists use only premium products.",
      longDescriptionAr: "استمتعي بخدمات تصفيف الشعر الفاخرة لدينا، والمصممة خصيصًا لأسلوبك وشخصيتك الفريدة. يستخدم مصففي الشعر الرئيسيين لدينا منتجات متميزة فقط.",
      longDescriptionDe: "Gönnen Sie sich unsere luxuriösen Haarstyling-Services, die auf Ihren einzigartigen Stil und Ihre Persönlichkeit zugeschnitten sind. Unsere Meisterstylisten verwenden nur Premium-Produkte.",
      longDescriptionTr: "Benzersiz stilinize ve kişiliğinize göre özel olarak tasarlanmış lüks saç şekillendirme hizmetlerimizin keyfini çıkarın. Usta stilistlerimiz sadece premium ürünler kullanır.",
      duration: 120,
      price: 600,
      imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      imageLarge: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80",
      isActive: true
    }
  ];

  // Add memberships
  const membershipsData = [
    {
      membershipNumber: "GOLD0001",
      name: "Fatima Al-Maktoum",
      email: "fatima@example.com",
      phone: "+971 50 123 4567",
      type: "gold",
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    },
    {
      membershipNumber: "SILV0001",
      name: "Aisha Rahman",
      email: "aisha@example.com",
      phone: "+971 55 987 6543",
      type: "silver",
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
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