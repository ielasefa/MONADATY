import type { Language } from "@/lib/translation-utils";

const LANDING_COPY = {
  fr: {
    hero: {
      eyebrow: "BOISSONS EN GROS POUR LES PROFESSIONNELS",
      title: "TOUT CE QU’IL VOUS FAUT EN BOISSONS.\nEN GROS, LIVRÉ JUSQU’À VOUS.",
      description:
        "MONADATY simplifie l’approvisionnement de votre commerce avec un large choix de boissons en gros et un service pensé pour les professionnels.",
      primaryCta: "VOIR LE CATALOGUE",
      secondaryCta: "EXPLORER LES COLLECTIONS",
      categories: "Sodas · eaux · jus",
      value: "Épiceries · cafés · restaurants",
      visualLabel: "Boissons en gros, livrées",
      imageAlt: "Une sélection de boissons en gros disponible sur MONADATY",
    },
    featured: {
      eyebrow: "LES PLUS DEMANDÉS PAR NOS CLIENTS PROS",
      title: "MEILLEURES VENTES",
      description:
        "Les boissons les plus demandées par les commerces, disponibles en gros.",
      cta: "VOIR TOUTES LES BOISSONS",
      badge: "POPULAIRE",
    },
    collections: {
      eyebrow: "APPROVISIONNEZ-VOUS SIMPLEMENT",
      title: "EXPLOREZ NOS COLLECTIONS",
      description:
        "Sodas, eaux, jus et plus : tout ce qu’il faut à votre commerce, au même endroit.",
      label: "COLLECTION",
      explore: "EXPLORER LA COLLECTION",
      viewProducts: "VOIR LES PRODUITS",
      close: "FERMER",
      viewCollection: "VOIR LA COLLECTION",
      productCount: "3 boissons à découvrir dans cette collection",
      empty: "De nouvelles boissons arrivent bientôt dans cette collection.",
    },
    value: {
      eyebrow: "L’APPROVISIONNEMENT SIMPLIFIÉ",
      title: "DU CHOIX. DES PRIX DE GROS.",
      description:
        "De quoi approvisionner votre boutique, café ou restaurant : commandez simplement vos boissons en gros, elles arrivent jusqu’à vous.\nPRIX DE GROS — Des tarifs pensés pour l’achat en gros par les professionnels.\nLARGE SÉLECTION — Toutes les catégories de boissons au même endroit.\nLIVRAISON JUSQU’À VOUS — Votre commande livrée directement à votre commerce.\nCOMMANDE SIMPLE — Trouvez et commandez vos boissons en quelques minutes.",
      cta: "DÉCOUVRIR MONADATY",
      imageLabel: "SODAS · EAUX · JUS · ET PLUS",
    },
    social: {
      eyebrow: "AVIS CLIENTS",
      title: "LA SATISFACTION DE NOS CLIENTS.",
      intro:
        "Des avis partagés après chaque commande par des professionnels qui s’approvisionnent chez nous.",
      quotes: [
        "Je m’approvisionne pour mon épicerie ici : tout est simple, de la commande à la livraison.",
        "Un large choix de boissons en gros et un service professionnel. Je recommanderai sans hésiter.",
        "Une commande claire et une livraison jusqu’au magasin. Exactement ce qu’il me fallait.",
      ],
    },
    discovery: {
      eyebrow: "LES INDISPENSABLES DU RAYON",
      description:
        "Des sodas connus aux eaux et jus du quotidien, retrouvez les boissons qui tournent le plus dans votre commerce. Commandez en ligne, on livre jusqu’à vous.",
      visualLabel: "VOS BOISSONS, LIVRÉES",
      explore: "DÉCOUVRIR LES BOISSONS",
    },
    newsletter: {
      eyebrow: "NOUVEAUTÉS · ACTUALITÉS",
      title: "RESTEZ AU COURANT.",
      description:
        "Recevez les nouveautés et les actualités MONADATY pour votre commerce.",
      placeholder: "Votre adresse e-mail",
      button: "S’ABONNER",
    },
    finalCta: {
      eyebrow: "UN BESOIN EN BOISSONS ?",
      title: "VOS BOISSONS EN GROS,\nLIVRÉES JUSQU’À VOUS.",
      description:
        "Sodas, eaux, jus et plus : commandez simplement vos boissons en gros, nous nous occupons de la livraison.",
      primary: "COMMANDER MAINTENANT",
      secondary: "DÉCOUVRIR MONADATY",
    },
    shop: {
      eyebrow: "TOUTES NOS BOISSONS EN GROS",
      title: "COMMANDEZ VOS BOISSONS EN GROS",
      description: "Sodas, eaux, jus et plus — tout ce qu’il faut à votre commerce, au même endroit.",
    },
    wishlist: {
      eyebrow: "VOTRE SÉLECTION",
      title: "VOS FAVORIS",
      description: "Gardez les boissons dont votre commerce a besoin sous la main et revenez les commander quand vous voulez.",
    },
    checkout: {
      eyebrow: "PAIEMENT SÉCURISÉ",
      title: "FINALISEZ VOTRE COMMANDE",
      description: "Renseignez vos informations de livraison, vérifiez votre panier et recevez votre commande directement à votre commerce.",
    },
    about: {
      eyebrow: "LE FOURNISSEUR DE BOISSONS DES PROFESSIONNELS",
      title: "DU CHOIX. DES PRIX DE GROS. UNE COMMANDE SIMPLE.",
      description: "MONADATY fournit épiceries, cafés, restaurants, snacks, hôtels et revendeurs en boissons : sodas, eaux, jus et grandes marques, avec un service simple et professionnel.",
      storyEyebrow: "POUR CHAQUE COMMERCE",
      storyTitle: "TOUT CE DONT VOTRE COMMERCE A BESOIN.",
      storyDescription: "Du dépannage au réassort régulier, nous simplifions la commande de vos boissons en gros, du choix du catalogue jusqu’à la livraison.",
      valuesEyebrow: "POURQUOI MONADATY",
      valuesTitle: "UNE MEILLEURE FAÇON DE VOUS APPROVISIONNER.",
      values: [
        { title: "Large choix", description: "Sodas, eaux, jus et marques connues réunis dans un catalogue simple à parcourir." },
        { title: "Prix de gros", description: "Des tarifs pensés pour l’achat en gros par les professionnels." },
        { title: "Commande simple", description: "Trouvez et commandez vos boissons en quelques minutes, sur mobile comme sur ordinateur." },
        { title: "Livraison jusqu’à vous", description: "Votre commande livrée directement à l’adresse de votre commerce." },
      ],
      closingTitle: "PRÊT À APPROVISIONNER VOTRE COMMERCE ?",
      closingDescription: "Parcourez notre catalogue et passez votre commande en gros en quelques étapes.",
      cta: "COMMANDER DES BOISSONS",
    },
    footer: {
      newsletterEyebrow: "NOUVEAUTÉS · ACTUALITÉS",
      newsletterTitle: "RESTEZ AU COURANT.",
      newsletterDescription:
        "Recevez les nouveautés et les actualités MONADATY pour votre commerce.",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "Votre adresse e-mail",
      newsletterButton: "S’ABONNER",
      brandDescription:
        "Boissons en gros pour épiceries, cafés, restaurants et commerces — du choix, des prix de gros et une commande simple.",
    },
  },
  en: {
    hero: {
      eyebrow: "WHOLESALE DRINKS FOR PROFESSIONALS",
      title: "EVERYTHING YOUR BUSINESS NEEDS\nIN BEVERAGES, DELIVERED TO YOU.",
      description:
        "MONADATY makes stocking your store simple, with a wide range of wholesale beverages and a service built for professionals.",
      primaryCta: "BROWSE THE CATALOGUE",
      secondaryCta: "EXPLORE COLLECTIONS",
      categories: "Soda · water · juice",
      value: "Grocers · cafés · restaurants",
      visualLabel: "Wholesale drinks, delivered",
      imageAlt: "A selection of wholesale drinks available from MONADATY",
    },
    featured: {
      eyebrow: "MOST ORDERED BY OUR PROFESSIONAL CLIENTS",
      title: "BEST SELLERS",
      description: "The drinks businesses order most, available in wholesale quantities.",
      cta: "SHOP ALL DRINKS",
      badge: "POPULAR",
    },
    collections: {
      eyebrow: "STOCK UP WITH EASE",
      title: "EXPLORE OUR COLLECTIONS",
      description: "Soda, water, juice and more — everything your business needs, in one place.",
      label: "COLLECTION",
      explore: "EXPLORE COLLECTION",
      viewProducts: "VIEW PRODUCTS",
      close: "CLOSE",
      viewCollection: "VIEW COLLECTION",
      productCount: "3 drinks to discover in this collection",
      empty: "More drinks are coming to this collection soon.",
    },
    value: {
      eyebrow: "WHOLESALE MADE SIMPLE",
      title: "MORE CHOICE. WHOLESALE PRICES.",
      description:
        "Everything you need to stock your shop, café or restaurant: order your beverages in bulk with ease and have them delivered to you.\nWHOLESALE PRICING — Terms built for professional buyers.\nWIDE SELECTION — Every beverage category in one place.\nDELIVERY TO YOU — Your order delivered straight to your business.\nEASY ORDERING — Find and order your drinks in minutes.",
      cta: "DISCOVER MONADATY",
      imageLabel: "SODA · WATER · JUICE · AND MORE",
    },
    social: {
      eyebrow: "CUSTOMER REVIEWS",
      title: "WHAT OUR CUSTOMERS SAY.",
      intro:
        "Feedback shared after every order by professionals who source their stock with us.",
      quotes: [
        "I supply my grocery store from here: everything is simple, from ordering to delivery.",
        "A wide range of wholesale drinks and a professional service. I’ll definitely order again.",
        "Clear ordering and delivery right to my shop. Exactly what I needed.",
      ],
    },
    discovery: {
      eyebrow: "SHELF ESSENTIALS",
      description:
        "From well-known sodas to everyday waters and juices, find the drinks that move fastest in your business. Order online and we deliver to you.",
      visualLabel: "YOUR DRINKS, DELIVERED",
      explore: "DISCOVER DRINKS",
    },
    newsletter: {
      eyebrow: "NEW ARRIVALS · UPDATES",
      title: "STAY IN THE LOOP.",
      description:
        "Get new arrivals and MONADATY updates for your business.",
      placeholder: "Your email address",
      button: "SUBSCRIBE",
    },
    finalCta: {
      eyebrow: "NEED TO RESTOCK?",
      title: "YOUR WHOLESALE DRINKS,\nDELIVERED TO YOU.",
      description:
        "Sodas, water, juices and more: order your beverages in bulk with ease and leave the delivery to us.",
      primary: "ORDER NOW",
      secondary: "DISCOVER MONADATY",
    },
    shop: {
      eyebrow: "ALL OUR WHOLESALE DRINKS",
      title: "ORDER YOUR DRINKS IN BULK",
      description: "Sodas, water, juices and more — everything your business needs, in one place.",
    },
    wishlist: {
      eyebrow: "YOUR SELECTION",
      title: "YOUR FAVORITES",
      description: "Keep the drinks your business relies on close and come back to order them whenever you are ready.",
    },
    checkout: {
      eyebrow: "SECURE CHECKOUT",
      title: "COMPLETE YOUR ORDER",
      description: "Add your delivery details, review your basket and receive your order right at your business.",
    },
    about: {
      eyebrow: "THE BEVERAGE SUPPLIER FOR PROFESSIONALS",
      title: "MORE CHOICE. WHOLESALE PRICES. EASY ORDERING.",
      description: "MONADATY supplies grocery stores, cafés, restaurants, snacks, hotels and resellers with beverages: soda, water, juice and leading brands, with a simple, professional service.",
      storyEyebrow: "FOR EVERY BUSINESS",
      storyTitle: "EVERYTHING YOUR BUSINESS NEEDS.",
      storyDescription: "From a quick top-up to regular restocking, we make ordering wholesale beverages simple — from browsing the catalogue to delivery.",
      valuesEyebrow: "WHY MONADATY",
      valuesTitle: "A BETTER WAY TO STOCK YOUR BUSINESS.",
      values: [
        { title: "Wide selection", description: "Soda, water, juice and leading brands gathered in one easy-to-browse catalogue." },
        { title: "Wholesale pricing", description: "Terms built for professional bulk buying." },
        { title: "Easy ordering", description: "Find and order your drinks in minutes, on mobile or desktop." },
        { title: "Delivery to you", description: "Your order delivered straight to your business address." },
      ],
      closingTitle: "READY TO STOCK YOUR BUSINESS?",
      closingDescription: "Browse the catalogue and place your wholesale order in just a few steps.",
      cta: "ORDER DRINKS",
    },
    footer: {
      newsletterEyebrow: "NEW ARRIVALS · UPDATES",
      newsletterTitle: "STAY IN THE LOOP.",
      newsletterDescription:
        "Get new arrivals and MONADATY updates for your business.",
      emailLabel: "Email address",
      emailPlaceholder: "Your email address",
      newsletterButton: "SUBSCRIBE",
      brandDescription:
        "Wholesale beverages for grocers, cafés, restaurants and businesses — wide choice, wholesale pricing and easy ordering.",
    },
  },
  ar: {
    hero: {
      eyebrow: "مشروبات بالجملة للمهنيين",
      title: "كل ما تحتاجه من المشروبات بالجملة…\nيوصلك حتى لعندك",
      description:
        "نوفر لك مجموعة متنوعة من المشروبات لتلبية احتياجات محلك، مع طلب سهل وتوصيل حتى لعندك.",
      primaryCta: "تصفح الكاتالوج",
      secondaryCta: "استكشف المجموعات",
      categories: "مشروبات غازية · مياه · عصائر",
      value: "بقالات · مقاهي · مطاعم",
      visualLabel: "مشروبات بالجملة، تُوصل إليك",
      imageAlt: "تشكيلة من المشروبات بالجملة المتوفرة لدى موناداتي",
    },
    featured: {
      eyebrow: "الأكثر طلباً من طرف المهنيين",
      title: "الأكثر مبيعاً",
      description: "المشروبات الأكثر طلباً من المحلات والتجار، متوفرة بالجملة.",
      cta: "تسوّق جميع المشروبات",
      badge: "الأكثر طلباً",
    },
    collections: {
      eyebrow: "جهّز مخزونك بسهولة",
      title: "استكشف مجموعاتنا",
      description: "مشروبات غازية ومياه وعصائر وأكثر — كل احتياجات محلك في مكان واحد.",
      label: "مجموعة",
      explore: "استكشف المجموعة",
      viewProducts: "عرض المنتجات",
      close: "إغلاق",
      viewCollection: "عرض المجموعة",
      productCount: "3 مشروبات لاكتشافها في هذه المجموعة",
      empty: "ستتوفر مشروبات جديدة في هذه المجموعة قريباً.",
    },
    value: {
      eyebrow: "التزويد بالمشروبات ببساطة",
      title: "خيارات أكثر. أسعار الجملة.",
      description:
        "كل ما تحتاجه لتزويد محلك أو مقهاك أو مطعمك: اطلب مشروباتك بالجملة بسهولة وسنوصلها إليك.\nأسعار الجملة — أسعار مصممة للشراء بالجملة للمهنيين.\nتشكيلة واسعة — جميع فئات المشروبات في مكان واحد.\nتوصيل حتى لعندك — طلبك يوصل مباشرة إلى محلك.\nطلب سهل — اعثر على مشروباتك واطلبها في دقائق.",
      cta: "اكتشف موناداتي",
      imageLabel: "مشروبات غازية · مياه · عصائر · وأكثر",
    },
    social: {
      eyebrow: "آراء العملاء",
      title: "ماذا يقول عملاؤنا.",
      intro:
        "آراء يشاركها مهنيون يزودون مخزون محلاتهم من عندنا.",
      quotes: [
        "أزود بقالتي من هنا: كل شيء سهل، من الطلب إلى التوصيل.",
        "تشكيلة واسعة من المشروبات بالجملة وخدمة مهنية. سأطلب من جديد بالتأكيد.",
        "طلب واضح وتوصيل حتى المحل. هذا بالضبط ما كنت أبحث عنه.",
      ],
    },
    discovery: {
      eyebrow: "أساسيات الرف",
      description:
        "من المشروبات الغازية المعروفة إلى المياه والعصائر اليومية، تجد هنا المشروبات الأكثر دوراناً في محلك. اطلب عبر الإنترنت وخلي التوصيل علينا.",
      visualLabel: "مشروباتك تصلك أينما كنت",
      explore: "اكتشف المشروبات",
    },
    newsletter: {
      eyebrow: "منتجات جديدة · أخبار",
      title: "ابقَ على اطلاع.",
      description: "تابع المنتجات الجديدة وأخبار موناداتي الخاصة بمحلك.",
      placeholder: "بريدك الإلكتروني",
      button: "اشترك",
    },
    finalCta: {
      eyebrow: "محتاج تزود مخزونك؟",
      title: "مشروباتك بالجملة…\nتوصلك حتى لعندك",
      description:
        "مشروبات غازية ومياه وعصائر وأكثر: اطلب مشروباتك بالجملة بسهولة وخلي التوصيل علينا.",
      primary: "اطلب الآن",
      secondary: "اكتشف موناداتي",
    },
    shop: {
      eyebrow: "جميع مشروباتنا بالجملة",
      title: "اطلب مشروباتك بالجملة",
      description: "مشروبات غازية ومياه وعصائر وأكثر — كل ما يحتاجه محلك في مكان واحد.",
    },
    wishlist: {
      eyebrow: "اختياراتك",
      title: "مشروباتك المفضلة",
      description: "احتفظ بالمشروبات التي يحتاجها محلك لتعود وتطلبها متى شئت.",
    },
    checkout: {
      eyebrow: "دفع آمن",
      title: "أكمل طلبك",
      description: "أدخل معلومات التوصيل، راجع سلتك واستلم طلبك عند محلك.",
    },
    about: {
      eyebrow: "موزع المشروبات للمهنيين",
      title: "خيارات أكثر. أسعار الجملة. طلب سهل.",
      description: "تزود موناداتي البقالات والمقاهي والمطاعم وسناكات والفنادق والتجار بالمشروبات: مشروبات غازية ومياه وعصائر وعلامات معروفة، مع خدمة بسيطة ومهنية.",
      storyEyebrow: "لكل محل",
      storyTitle: "كل ما يحتاجه محلك.",
      storyDescription: "من التعبئة السريعة إلى إعادة التزويد الدورية، نسهّل عليك طلب المشروبات بالجملة، من اختيار الكاتالوج إلى التوصيل.",
      valuesEyebrow: "لماذا موناداتي",
      valuesTitle: "طريقة أفضل لتزويد محلك.",
      values: [
        { title: "تشكيلة واسعة", description: "مشروبات غازية ومياه وعصائر وعلامات معروفة ضمن كاتالوج سهل التصفح." },
        { title: "أسعار الجملة", description: "أسعار مصممة للشراء بالجملة من طرف المهنيين." },
        { title: "طلب سهل", description: "اعثر على مشروباتك واطلبها في دقائق، من الهاتف أو الحاسوب." },
        { title: "توصيل حتى لعندك", description: "طلبك يوصل مباشرة إلى عنوان محلك." },
      ],
      closingTitle: "جاهز لتزويد محلك؟",
      closingDescription: "تصفح الكاتالوج وضع طلبك بالجملة في خطوات بسيطة.",
      cta: "اطلب المشروبات",
    },
    footer: {
      newsletterEyebrow: "منتجات جديدة · أخبار",
      newsletterTitle: "ابقَ على اطلاع.",
      newsletterDescription:
        "تابع المنتجات الجديدة وأخبار موناداتي الخاصة بمحلك.",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "بريدك الإلكتروني",
      newsletterButton: "اشترك",
      brandDescription:
        "مشروبات بالجملة للبقالات والمقاهي والمطاعم والمحلات — تشكيلة واسعة وأسعار جملة وطلب سهل.",
    },
  },
} as const;

export type LandingCopy = (typeof LANDING_COPY)[Language];

export function getLandingCopy(language: Language): LandingCopy {
  return LANDING_COPY[language];
}
