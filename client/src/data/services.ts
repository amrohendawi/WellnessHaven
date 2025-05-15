// Core services offered by Dubai Rose
export const servicesList = [
  {
    id: 1,
    slug: 'laser-hair-removal',
    category: 'laser',
    name: {
      en: 'Laser Hair Removal',
      ar: 'إزالة الشعر بالليزر',
      de: 'Laser-Haarentfernung',
      tr: 'Lazer Epilasyon',
    },
    description: {
      en: 'Permanent hair reduction using advanced laser technology',
      ar: 'إزالة دائمة للشعر باستخدام تقنية الليزر المتطورة',
      de: 'Dauerhafte Haarentfernung mit fortschrittlicher Lasertechnologie',
      tr: 'Gelişmiş lazer teknolojisi kullanarak kalıcı tüy azaltma',
    },
    longDescription: {
      en: 'Our state-of-the-art laser hair removal treatment provides permanent hair reduction in a comfortable and safe environment. The treatment is effective for all skin types and targets unwanted hair on the face, underarms, legs, bikini area, and more.',
      ar: 'توفر علاجات إزالة الشعر بالليزر المتطورة لدينا تقليلًا دائمًا للشعر في بيئة مريحة وآمنة. العلاج فعال لجميع أنواع البشرة ويستهدف الشعر غير المرغوب فيه على الوجه والإبطين والساقين ومنطقة البيكيني والمزيد.',
      de: 'Unsere hochmoderne Laser-Haarentfernungsbehandlung bietet eine dauerhafte Haarreduktion in einer komfortablen und sicheren Umgebung. Die Behandlung ist für alle Hauttypen wirksam und zielt auf unerwünschte Haare im Gesicht, unter den Achseln, an den Beinen, im Bikinibereich und mehr ab.',
      tr: 'Son teknoloji lazer epilasyon tedavimiz, konforlu ve güvenli bir ortamda kalıcı tüy azaltma sağlar. Tedavi, tüm cilt tipleri için etkilidir ve yüz, koltuk altı, bacaklar, bikini bölgesi ve daha fazlasındaki istenmeyen tüyleri hedefler.',
    },
    benefits: [
      {
        en: 'Permanent reduction of hair growth',
        ar: 'تقليل دائم لنمو الشعر',
        de: 'Dauerhafte Reduzierung des Haarwuchses',
        tr: 'Kalıcı tüy büyümesi azaltma',
      },
      {
        en: 'Painless treatment with cooling technology',
        ar: 'علاج غير مؤلم مع تقنية التبريد',
        de: 'Schmerzlose Behandlung mit Kühltechnologie',
        tr: 'Soğutma teknolojisi ile ağrısız tedavi',
      },
      {
        en: 'Fast treatment sessions',
        ar: 'جلسات علاج سريعة',
        de: 'Schnelle Behandlungssitzungen',
        tr: 'Hızlı tedavi seansları',
      },
    ],
    includes: [
      {
        en: 'Pre-treatment consultation',
        ar: 'استشارة ما قبل العلاج',
        de: 'Beratung vor der Behandlung',
        tr: 'Tedavi öncesi danışma',
      },
      {
        en: 'Custom treatment plan',
        ar: 'خطة علاج مخصصة',
        de: 'Individuelle Behandlungsplan',
        tr: 'Özel tedavi planı',
      },
      {
        en: 'Post-treatment care instructions',
        ar: 'تعليمات العناية بعد العلاج',
        de: 'Pflegehinweise nach der Behandlung',
        tr: 'Tedavi sonrası bakım talimatları',
      },
    ],
    duration: 30,
    price: 500,
    imageUrl:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    imageLarge:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80',
  },
  {
    id: 2,
    slug: 'skin-tightening',
    category: 'laser',
    name: {
      en: 'Skin Tightening',
      ar: 'شد البشرة',
      de: 'Hautstraffung',
      tr: 'Cilt Germe',
    },
    description: {
      en: 'Non-invasive treatments to firm and tone skin',
      ar: 'علاجات غير جراحية لشد وتحسين مظهر البشرة',
      de: 'Nicht-invasive Behandlungen zur Straffung und Festigung der Haut',
      tr: 'Cildi sıkılaştırmak ve tonlamak için non-invaziv tedaviler',
    },
    longDescription: {
      en: "Our skin tightening treatments use radiofrequency technology to stimulate collagen production, resulting in firmer, smoother skin. It's an effective solution for facial sagging, loose skin on the neck, arms, abdomen, and thighs.",
      ar: 'تستخدم علاجات شد البشرة لدينا تقنية التردد الراديوي لتحفيز إنتاج الكولاجين، مما يؤدي إلى بشرة أكثر ثباتًا ونعومة. إنه حل فعال لترهل الوجه والبشرة المترهلة في الرقبة والذراعين والبطن والفخذين.',
      de: 'Unsere Hautstraffungsbehandlungen verwenden Radiofrequenztechnologie, um die Kollagenproduktion anzuregen, was zu einer festeren, glatteren Haut führt. Es ist eine effektive Lösung für Erschlaffungen im Gesicht, lockere Haut am Hals, an den Armen, am Bauch und an den Oberschenkeln.',
      tr: 'Cilt germe tedavilerimiz, kolajen üretimini uyarmak için radyofrekans teknolojisini kullanır ve daha sıkı, daha pürüzsüz bir cilt sağlar. Yüz sarkması, boyun, kollar, karın ve bacaklarda gevşek cilt için etkili bir çözümdür.',
    },
    duration: 45,
    price: 800,
    imageUrl:
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 3,
    slug: 'tattoo-removal',
    category: 'laser',
    name: {
      en: 'Tattoo Removal',
      ar: 'إزالة الوشم',
      de: 'Tattooentfernung',
      tr: 'Dövme Silme',
    },
    description: {
      en: 'Advanced laser treatment to remove unwanted tattoos',
      ar: 'علاج متقدم بالليزر لإزالة الوشم غير المرغوب فيه',
      de: 'Fortschrittliche Laserbehandlung zur Entfernung unerwünschter Tattoos',
      tr: 'İstenmeyen dövmeleri çıkarmak için gelişmiş lazer tedavisi',
    },
    duration: 60,
    price: 1200,
    imageUrl:
      'https://images.unsplash.com/photo-1561643241-9abf82d76a68?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 4,
    slug: 'facial-cleansing',
    category: 'facial',
    name: {
      en: 'Facial Cleansing',
      ar: 'تنظيف الوجه',
      de: 'Gesichtsreinigung',
      tr: 'Yüz Temizliği',
    },
    description: {
      en: 'Deep cleansing treatments for radiant skin',
      ar: 'علاجات تنظيف عميقة لبشرة مشرقة',
      de: 'Tiefenreinigungsbehandlungen für strahlende Haut',
      tr: 'Parlak cilt için derin temizleme tedavileri',
    },
    duration: 60,
    price: 400,
    imageUrl:
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 5,
    slug: 'fillers-botox',
    category: 'facial',
    name: {
      en: 'Fillers & Botox',
      ar: 'الفيلر والبوتوكس',
      de: 'Filler & Botox',
      tr: 'Dolgu & Botoks',
    },
    description: {
      en: 'Rejuvenating treatments for youthful appearance',
      ar: 'علاجات مجددة للشباب للحصول على مظهر شبابي',
      de: 'Verjüngende Behandlungen für jugendliches Aussehen',
      tr: 'Genç görünüm için gençleştirici tedaviler',
    },
    duration: 45,
    price: 1500,
    imageUrl:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 6,
    slug: 'bridal-preparation',
    category: 'beauty',
    name: {
      en: 'Bridal Preparation',
      ar: 'تحضير العروس',
      de: 'Brautvorbereitungen',
      tr: 'Gelin Hazırlığı',
    },
    description: {
      en: 'Complete beauty package for your special day',
      ar: 'باقة جمال كاملة ليومك الخاص',
      de: 'Komplettes Schönheitspaket für Ihren besonderen Tag',
      tr: 'Özel gününüz için eksiksiz güzellik paketi',
    },
    duration: 180,
    price: 3000,
    imageUrl:
      'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 7,
    slug: 'hair-styling',
    category: 'hair',
    name: {
      en: 'Hair Styling',
      ar: 'تصفيف الشعر',
      de: 'Haarstyling',
      tr: 'Saç Şekillendirme',
    },
    description: {
      en: 'Professional styling for any occasion',
      ar: 'تصفيف احترافي لأي مناسبة',
      de: 'Professionelles Styling für jeden Anlass',
      tr: 'Her ortam için profesyonel şekillendirme',
    },
    duration: 60,
    price: 350,
    imageUrl:
      'https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 8,
    slug: 'professional-makeup',
    category: 'beauty',
    name: {
      en: 'Professional Makeup',
      ar: 'مكياج احترافي',
      de: 'Professionelles Make-up',
      tr: 'Profesyonel Makyaj',
    },
    description: {
      en: 'Flawless makeup for special events and occasions',
      ar: 'مكياج مثالي للمناسبات والفعاليات الخاصة',
      de: 'Makelloses Make-up für besondere Anlässe und Veranstaltungen',
      tr: 'Özel etkinlikler ve durumlar için kusursuz makyaj',
    },
    duration: 60,
    price: 500,
    imageUrl:
      'https://images.unsplash.com/photo-1643185539104-3622eb1f0ff6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 9,
    slug: 'eyelash-extensions',
    category: 'beauty',
    name: {
      en: 'Eyelash Extensions',
      ar: 'تمديد الرموش',
      de: 'Wimpernverlängerungen',
      tr: 'Kirpik Uzatma',
    },
    description: {
      en: 'Full, natural-looking eyelash extensions',
      ar: 'رموش كاملة ذات مظهر طبيعي',
      de: 'Volle, natürlich aussehende Wimpernverlängerungen',
      tr: 'Dolgun, doğal görünümlü kirpik uzatmaları',
    },
    duration: 90,
    price: 600,
    imageUrl:
      'https://images.unsplash.com/photo-1515426292618-5ea75cb5a1f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 10,
    slug: 'hair-extensions',
    category: 'hair',
    name: {
      en: 'Hair Extensions',
      ar: 'إكستنشن الشعر',
      de: 'Haarverlängerungen',
      tr: 'Saç Uzatma',
    },
    description: {
      en: 'Premium quality hair extensions for length and volume',
      ar: 'إكستنشن شعر عالي الجودة للطول والحجم',
      de: 'Hochwertige Haarverlängerungen für Länge und Volumen',
      tr: 'Uzunluk ve hacim için premium kaliteli saç uzatma',
    },
    duration: 120,
    price: 1500,
    imageUrl:
      'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 11,
    slug: 'lip-tattoo',
    category: 'beauty',
    name: {
      en: 'Lip Tattoo',
      ar: 'تاتو الشفاه',
      de: 'Lippen-Tattoo',
      tr: 'Dudak Dövmesi',
    },
    description: {
      en: 'Long-lasting lip color enhancement',
      ar: 'تعزيز لون الشفاه طويل الأمد',
      de: 'Langanhaltende Farbverbesserung der Lippen',
      tr: 'Uzun süreli dudak rengi geliştirme',
    },
    duration: 90,
    price: 700,
    imageUrl:
      'https://images.unsplash.com/photo-1588554894134-def7914396a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 12,
    slug: 'carbon-facial-mask',
    category: 'facial',
    name: {
      en: 'Carbon Facial Mask',
      ar: 'قناع الوجه بالكربون',
      de: 'Kohlenstoff-Gesichtsmaske',
      tr: 'Karbon Yüz Maskesi',
    },
    description: {
      en: 'Deep cleansing and rejuvenating carbon treatment',
      ar: 'تنظيف عميق ومعالجة تجديد بالكربون',
      de: 'Tiefenreinigung und verjüngende Kohlenstoffbehandlung',
      tr: 'Derin temizleme ve gençleştirici karbon tedavisi',
    },
    duration: 60,
    price: 550,
    imageUrl:
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 13,
    slug: 'teeth-whitening',
    category: 'beauty',
    name: {
      en: 'Teeth Whitening',
      ar: 'تبييض الأسنان',
      de: 'Zahnaufhellung',
      tr: 'Diş Beyazlatma',
    },
    description: {
      en: 'Professional teeth whitening for a bright smile',
      ar: 'تبييض أسنان احترافي لابتسامة مشرقة',
      de: 'Professionelle Zahnaufhellung für ein strahlendes Lächeln',
      tr: 'Parlak bir gülümseme için profesyonel diş beyazlatma',
    },
    duration: 60,
    price: 800,
    imageUrl:
      'https://images.unsplash.com/photo-1581594693702-48c05c429b2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 14,
    slug: 'waxing',
    category: 'beauty',
    name: {
      en: 'Waxing',
      ar: 'إزالة الشعر بالشمع',
      de: 'Waxing',
      tr: 'Ağda',
    },
    description: {
      en: 'Smooth and painless hair removal',
      ar: 'إزالة الشعر بسلاسة وبدون ألم',
      de: 'Glatte und schmerzlose Haarentfernung',
      tr: 'Pürüzsüz ve ağrısız tüy alma',
    },
    duration: 30,
    price: 200,
    imageUrl:
      'https://images.unsplash.com/photo-1546552768-9e3a5889e81d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 15,
    slug: 'hair-coloring',
    category: 'hair',
    name: {
      en: 'Hair Coloring & Highlights',
      ar: 'صبغ الشعر والهايلايت',
      de: 'Haarfärbung & Highlights',
      tr: 'Saç Boyama & Röfle',
    },
    description: {
      en: 'Custom hair color and highlight services',
      ar: 'خدمات تلوين الشعر والهايلايت المخصصة',
      de: 'Individuelle Haarfarbe und Highlight-Service',
      tr: 'Özel saç rengi ve röfle hizmetleri',
    },
    duration: 120,
    price: 750,
    imageUrl:
      'https://images.unsplash.com/photo-1519165647495-cea47e042927?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 16,
    slug: 'chemical-peeling',
    category: 'facial',
    name: {
      en: 'Chemical Peeling',
      ar: 'التقشير الكيميائي',
      de: 'Chemisches Peeling',
      tr: 'Kimyasal Peeling',
    },
    description: {
      en: 'Skin renewal treatment including Green Peel',
      ar: 'علاج تجديد البشرة بما في ذلك التقشير الأخضر',
      de: 'Hauterneuerungsbehandlung einschließlich Green Peel',
      tr: 'Yeşil Soyma dahil cilt yenileme tedavisi',
    },
    duration: 45,
    price: 650,
    imageUrl:
      'https://images.unsplash.com/photo-1498843053639-170ff2122f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  },
];
