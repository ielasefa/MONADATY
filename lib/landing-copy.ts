import type { Language } from "@/lib/translation-utils";

const LANDING_COPY = {
  fr: {
    hero: {
      eyebrow: "VOS BOISSONS PRÉFÉRÉES, AU MÊME ENDROIT",
      title: "RAFRAÎCHISSEZ\nVOTRE JOURNÉE.",
      description:
        "Sodas, eaux, jus et bien plus : retrouvez vos marques préférées à prix avantageux, sans vous déplacer.",
      primaryCta: "ACHETER DES BOISSONS",
      secondaryCta: "EXPLORER LES COLLECTIONS",
      categories: "Sodas · eaux · jus",
      value: "Plus de choix · meilleurs prix",
      visualLabel: "Tout pour vous rafraîchir",
      imageAlt: "Une sélection de boissons disponibles sur MONADATY",
    },
    featured: {
      eyebrow: "LES PRÉFÉRÉS DE NOS CLIENTS",
      title: "MEILLEURES VENTES",
      description:
        "Les boissons que tout le monde aime, à des prix qui donnent envie.",
      cta: "VOIR TOUTES LES BOISSONS",
      badge: "POPULAIRE",
    },
    collections: {
      eyebrow: "ACHETEZ À VOTRE FAÇON",
      title: "EXPLOREZ NOS COLLECTIONS",
      description:
        "Retrouvez vos marques et boissons préférées, réunies au même endroit.",
      label: "COLLECTION",
      explore: "EXPLORER LA COLLECTION",
      viewProducts: "VOIR LES PRODUITS",
      close: "FERMER",
      viewCollection: "VOIR LA COLLECTION",
      productCount: "3 boissons à découvrir dans cette collection",
      empty: "De nouvelles boissons arrivent bientôt dans cette collection.",
    },
    value: {
      eyebrow: "PLUS POUR VOTRE BUDGET",
      title: "PLUS DE CHOIX. DE MEILLEURS PRIX.",
      description:
        "De l’eau du quotidien aux sodas et jus que vous aimez, MONADATY vous aide à faire le plein facilement et à meilleur prix.\nPRIX AVANTAGEUX — Des prix compétitifs sur vos boissons préférées.\nLARGE SÉLECTION — Eaux, sodas, jus et plus au même endroit.\nLIVRAISON PRATIQUE — Vos boissons commandées en ligne, livrées simplement.\nACHAT FACILE — Trouvez, commandez et profitez sans complication.",
      cta: "ACHETER MAINTENANT",
      imageLabel: "SODAS · EAUX · JUS · ET PLUS",
    },
    social: {
      eyebrow: "AVIS CLIENTS",
      title: "DES FAVORIS VALIDÉS PAR NOS CLIENTS.",
      intro:
        "Des avis partagés après chaque commande, des essentiels du quotidien aux boissons des grandes occasions.",
      quotes: [
        "J’ai trouvé toutes mes boissons habituelles au même endroit, et la commande était vraiment simple.",
        "Un grand choix de marques et des prix intéressants. Je commanderai à nouveau sans hésiter.",
        "Une commande rapide, une sélection claire et une livraison pratique. Exactement ce qu’il me fallait.",
      ],
    },
    discovery: {
      eyebrow: "RETROUVEZ VOS FAVORIS",
      description:
        "Des essentiels du quotidien aux sodas les plus connus, trouvez une boisson pour chaque envie et chaque occasion. Commandez en ligne et faites-vous livrer simplement.",
      visualLabel: "VOS BOISSONS, LIVRÉES",
      explore: "DÉCOUVRIR LES BOISSONS",
    },
    newsletter: {
      eyebrow: "OFFRES · NOUVEAUTÉS · ACTUALITÉS",
      title: "RESTEZ AU FRAIS.",
      description:
        "Recevez nos dernières offres, nos nouveautés et les actualités MONADATY.",
      placeholder: "Votre adresse e-mail",
      button: "S’ABONNER",
    },
    finalCta: {
      eyebrow: "ENVIE DE FRAÎCHEUR ?",
      title: "UNE PETITE SOIF ? ON A CE QU’IL VOUS FAUT.",
      description:
        "Découvrez sodas, eaux, jus et plus à prix avantageux, avec une commande simple et une livraison pratique.",
      primary: "ACHETER MAINTENANT",
      secondary: "DÉCOUVRIR MONADATY",
    },
    shop: {
      eyebrow: "TOUTES VOS BOISSONS",
      title: "ACHETEZ VOS BOISSONS",
      description: "Sodas, eaux, jus et plus — tout ce qu’il vous faut au même endroit.",
    },
    wishlist: {
      eyebrow: "VOTRE SÉLECTION",
      title: "VOS FAVORIS",
      description: "Gardez vos boissons préférées à portée de main et retrouvez-les quand vous le souhaitez.",
    },
    checkout: {
      eyebrow: "PAIEMENT SÉCURISÉ",
      title: "FINALISEZ VOTRE COMMANDE",
      description: "Renseignez vos informations de livraison, vérifiez votre panier et passez commande en toute simplicité.",
    },
    about: {
      eyebrow: "LA BOUTIQUE DE VOS BOISSONS",
      title: "PLUS DE CHOIX. DE MEILLEURS PRIX. UNE COMMANDE SIMPLE.",
      description: "MONADATY réunit sodas, eaux, jus et grandes marques dans une boutique en ligne claire, pratique et pensée pour le quotidien.",
      storyEyebrow: "POUR CHAQUE ENVIE",
      storyTitle: "VOS FAVORIS, TOUS AU MÊME ENDROIT.",
      storyDescription: "Des essentiels du quotidien aux boissons pour recevoir, nous facilitons la découverte, la comparaison et la commande de vos produits préférés.",
      valuesEyebrow: "POURQUOI MONADATY",
      valuesTitle: "UNE MEILLEURE FAÇON D’ACHETER VOS BOISSONS.",
      values: [
        { title: "Plus de choix", description: "Sodas, eaux, jus et boissons populaires réunis dans une sélection simple à parcourir." },
        { title: "Bons prix", description: "Des prix avantageux pour les boissons que vous achetez et aimez déjà." },
        { title: "Achat facile", description: "Trouvez, comparez et commandez sans complication, sur mobile comme sur ordinateur." },
        { title: "Livraison pratique", description: "Vos boissons commandées en ligne et livrées à l’adresse de votre choix." },
      ],
      closingTitle: "PRÊT À TROUVER VOTRE PROCHAINE BOISSON ?",
      closingDescription: "Parcourez notre sélection et faites le plein de vos favoris en quelques étapes.",
      cta: "ACHETER DES BOISSONS",
    },
    footer: {
      newsletterEyebrow: "OFFRES · NOUVEAUTÉS · ACTUALITÉS",
      newsletterTitle: "RESTEZ AU FRAIS.",
      newsletterDescription:
        "Recevez nos dernières offres, nos nouveautés et les actualités MONADATY.",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "Votre adresse e-mail",
      newsletterButton: "S’ABONNER",
      brandDescription:
        "Sodas, eaux, jus et plus — du choix, des prix avantageux et une commande simple.",
    },
  },
  en: {
    hero: {
      eyebrow: "YOUR FAVORITE DRINKS, ONE PLACE",
      title: "REFRESH\nYOUR DAY.",
      description:
        "Shop your favorite sodas, water, juices and more at great prices, all in one convenient store.",
      primaryCta: "SHOP DRINKS",
      secondaryCta: "EXPLORE COLLECTIONS",
      categories: "Soda · water · juice",
      value: "More choice · better prices",
      visualLabel: "Refreshment, all in one place",
      imageAlt: "A selection of drinks available from MONADATY",
    },
    featured: {
      eyebrow: "CUSTOMER FAVORITES",
      title: "BEST SELLERS",
      description: "The drinks everyone loves, at prices you’ll love too.",
      cta: "SHOP ALL DRINKS",
      badge: "POPULAR",
    },
    collections: {
      eyebrow: "SHOP YOUR WAY",
      title: "EXPLORE OUR COLLECTIONS",
      description: "Find your favorite brands and drinks, all in one place.",
      label: "COLLECTION",
      explore: "EXPLORE COLLECTION",
      viewProducts: "VIEW PRODUCTS",
      close: "CLOSE",
      viewCollection: "VIEW COLLECTION",
      productCount: "3 drinks to discover in this collection",
      empty: "More drinks are coming to this collection soon.",
    },
    value: {
      eyebrow: "MORE FOR YOUR MONEY",
      title: "MORE CHOICE. BETTER PRICES.",
      description:
        "From everyday water to your favorite sodas and juices, MONADATY makes it easy to stock up for less.\nGREAT PRICES — Competitive prices on the drinks you love.\nWIDE SELECTION — Water, soda, juice and more in one place.\nCONVENIENT DELIVERY — Order your favorites online and have them delivered with ease.\nEASY SHOPPING — Find, order and enjoy without the hassle.",
      cta: "SHOP NOW",
      imageLabel: "SODA · WATER · JUICE · AND MORE",
    },
    social: {
      eyebrow: "CUSTOMER REVIEWS",
      title: "FAVORITES, APPROVED BY OUR CUSTOMERS.",
      intro:
        "Feedback shared after every order, from everyday essentials to drinks for special occasions.",
      quotes: [
        "I found all my usual drinks in one place, and ordering was genuinely easy.",
        "A great range of brands at good prices. I’ll definitely order again.",
        "Quick ordering, a clear selection and convenient delivery. Exactly what I needed.",
      ],
    },
    discovery: {
      eyebrow: "FIND YOUR FAVORITES",
      description:
        "From everyday essentials to iconic soft drinks, find something for every taste and occasion. Order online and have your favorites delivered with ease.",
      visualLabel: "YOUR DRINKS, DELIVERED",
      explore: "DISCOVER DRINKS",
    },
    newsletter: {
      eyebrow: "OFFERS · NEW ARRIVALS · UPDATES",
      title: "STAY REFRESHED.",
      description:
        "Get the latest offers, new arrivals and MONADATY updates.",
      placeholder: "Your email address",
      button: "SUBSCRIBE",
    },
    finalCta: {
      eyebrow: "READY TO REFRESH?",
      title: "THIRSTY? WE’VE GOT YOU.",
      description:
        "Discover sodas, water, juices and more at great prices, with easy ordering and convenient delivery.",
      primary: "SHOP NOW",
      secondary: "DISCOVER MONADATY",
    },
    shop: {
      eyebrow: "ALL YOUR DRINKS",
      title: "SHOP THE DRINKS",
      description: "Sodas, water, juices and more — all in one place.",
    },
    wishlist: {
      eyebrow: "YOUR SELECTION",
      title: "YOUR FAVORITES",
      description: "Keep the drinks you love close and come back to them whenever you are ready.",
    },
    checkout: {
      eyebrow: "SECURE CHECKOUT",
      title: "COMPLETE YOUR ORDER",
      description: "Add your delivery details, review your basket and place your order with confidence.",
    },
    about: {
      eyebrow: "YOUR ONLINE DRINKS STORE",
      title: "MORE CHOICE. BETTER PRICES. EASY SHOPPING.",
      description: "MONADATY brings soda, water, juice and popular beverage brands together in one clear, convenient online store.",
      storyEyebrow: "FOR EVERY OCCASION",
      storyTitle: "YOUR FAVORITES, ALL IN ONE PLACE.",
      storyDescription: "From everyday essentials to drinks for sharing, we make it easy to discover, compare and order the products you already enjoy.",
      valuesEyebrow: "WHY MONADATY",
      valuesTitle: "A BETTER WAY TO SHOP FOR DRINKS.",
      values: [
        { title: "More choice", description: "Soda, water, juice and popular drinks gathered in one easy-to-browse selection." },
        { title: "Good prices", description: "Competitive prices across the familiar drinks you already buy and love." },
        { title: "Easy shopping", description: "Find, compare and order without hassle, on mobile or desktop." },
        { title: "Convenient delivery", description: "Order your drinks online and have them delivered where you need them." },
      ],
      closingTitle: "READY TO FIND YOUR NEXT FAVORITE?",
      closingDescription: "Browse the selection and stock up on the drinks you love in just a few steps.",
      cta: "SHOP DRINKS",
    },
    footer: {
      newsletterEyebrow: "OFFERS · NEW ARRIVALS · UPDATES",
      newsletterTitle: "STAY REFRESHED.",
      newsletterDescription:
        "Get the latest offers, new arrivals and MONADATY updates.",
      emailLabel: "Email address",
      emailPlaceholder: "Your email address",
      newsletterButton: "SUBSCRIBE",
      brandDescription:
        "Soda, water, juice and more—great choice, good prices and easy ordering.",
    },
  },
  ar: {
    hero: {
      eyebrow: "مشروباتك المفضلة في مكان واحد",
      title: "أنعش\nيومك.",
      description:
        "تسوّق مشروباتك الغازية والمياه والعصائر وغيرها بأسعار مناسبة، بكل سهولة ومن مكان واحد.",
      primaryCta: "تسوّق المشروبات",
      secondaryCta: "استكشف المجموعات",
      categories: "مشروبات غازية · مياه · عصائر",
      value: "خيارات أكثر · أسعار أفضل",
      visualLabel: "كل ما ينعشك في مكان واحد",
      imageAlt: "تشكيلة من المشروبات المتوفرة لدى موناداتي",
    },
    featured: {
      eyebrow: "اختيارات عملائنا المفضلة",
      title: "الأكثر مبيعاً",
      description: "مشروبات يحبها الجميع، بأسعار ستحبها أنت أيضاً.",
      cta: "تسوّق جميع المشروبات",
      badge: "الأكثر طلباً",
    },
    collections: {
      eyebrow: "تسوّق بطريقتك",
      title: "استكشف مجموعاتنا",
      description: "اعثر على علاماتك ومشروباتك المفضلة في مكان واحد.",
      label: "مجموعة",
      explore: "استكشف المجموعة",
      viewProducts: "عرض المنتجات",
      close: "إغلاق",
      viewCollection: "عرض المجموعة",
      productCount: "3 مشروبات لاكتشافها في هذه المجموعة",
      empty: "ستتوفر مشروبات جديدة في هذه المجموعة قريباً.",
    },
    value: {
      eyebrow: "قيمة أكبر مقابل ميزانيتك",
      title: "خيارات أكثر. أسعار أفضل.",
      description:
        "من مياه الاستخدام اليومي إلى مشروباتك الغازية وعصائرك المفضلة، تجعل موناداتي التسوق والتوفير أسهل.\nأسعار مناسبة — أسعار تنافسية على المشروبات التي تحبها.\nتشكيلة واسعة — مياه ومشروبات غازية وعصائر وأكثر في مكان واحد.\nتوصيل مريح — اطلب مشروباتك المفضلة عبر الإنترنت واستلمها بكل سهولة.\nتسوّق سهل — اختر واطلب واستمتع من دون تعقيد.",
      cta: "ابدأ التسوق",
      imageLabel: "مشروبات غازية · مياه · عصائر · وأكثر",
    },
    social: {
      eyebrow: "آراء العملاء",
      title: "مشروبات مفضلة يوصي بها عملاؤنا.",
      intro:
        "آراء يشاركها عملاؤنا بعد الطلب، من الاحتياجات اليومية إلى مشروبات المناسبات.",
      quotes: [
        "وجدت كل مشروباتي المعتادة في مكان واحد، وكانت عملية الطلب سهلة جداً.",
        "تشكيلة واسعة من العلامات بأسعار مناسبة. سأطلب من جديد بالتأكيد.",
        "طلب سريع، واختيار واضح، وتوصيل مريح. هذا بالضبط ما كنت أبحث عنه.",
      ],
    },
    discovery: {
      eyebrow: "اعثر على مشروباتك المفضلة",
      description:
        "من الأساسيات اليومية إلى أشهر المشروبات الغازية، ستجد ما يناسب كل ذوق ومناسبة. اطلب عبر الإنترنت واستلم مشروباتك بسهولة.",
      visualLabel: "مشروباتك تصلك أينما كنت",
      explore: "اكتشف المشروبات",
    },
    newsletter: {
      eyebrow: "العروض · المنتجات الجديدة · الأخبار",
      title: "ابقَ منتعشاً.",
      description: "تابع أحدث العروض والمنتجات الجديدة وأخبار موناداتي.",
      placeholder: "بريدك الإلكتروني",
      button: "اشترك",
    },
    finalCta: {
      eyebrow: "جاهز للانتعاش؟",
      title: "عطشان؟ لدينا ما يناسبك.",
      description:
        "اكتشف المشروبات الغازية والمياه والعصائر وغيرها بأسعار مناسبة، مع طلب سهل وتوصيل مريح.",
      primary: "تسوّق الآن",
      secondary: "اكتشف موناداتي",
    },
    shop: {
      eyebrow: "كل مشروباتك",
      title: "تسوّق المشروبات",
      description: "مشروبات غازية ومياه وعصائر وأكثر — كل ما تحتاجه في مكان واحد.",
    },
    wishlist: {
      eyebrow: "اختياراتك",
      title: "مشروباتك المفضلة",
      description: "احتفظ بمشروباتك المفضلة لتعود إليها بسهولة عندما تكون جاهزاً للطلب.",
    },
    checkout: {
      eyebrow: "دفع آمن",
      title: "أكمل طلبك",
      description: "أدخل معلومات التوصيل، راجع سلتك وأكد طلبك بكل سهولة.",
    },
    about: {
      eyebrow: "متجرك الإلكتروني للمشروبات",
      title: "خيارات أكثر. أسعار أفضل. تسوّق أسهل.",
      description: "تجمع موناداتي المشروبات الغازية والمياه والعصائر والعلامات الشهيرة في متجر إلكتروني واضح ومريح.",
      storyEyebrow: "لكل مناسبة",
      storyTitle: "مشروباتك المفضلة في مكان واحد.",
      storyDescription: "من احتياجاتك اليومية إلى مشروبات المشاركة والمناسبات، نسهّل عليك الاكتشاف والمقارنة والطلب.",
      valuesEyebrow: "لماذا موناداتي",
      valuesTitle: "طريقة أفضل لشراء المشروبات.",
      values: [
        { title: "خيارات أكثر", description: "مشروبات غازية ومياه وعصائر ومشروبات شهيرة ضمن تشكيلة سهلة التصفح." },
        { title: "أسعار مناسبة", description: "أسعار تنافسية على المشروبات المعروفة التي تشتريها وتحبها." },
        { title: "تسوّق سهل", description: "ابحث وقارن واطلب من الهاتف أو الحاسوب من دون تعقيد." },
        { title: "توصيل مريح", description: "اطلب مشروباتك عبر الإنترنت واستلمها في العنوان الذي تختاره." },
      ],
      closingTitle: "جاهز لاكتشاف مشروبك القادم؟",
      closingDescription: "تصفح تشكيلتنا واطلب مشروباتك المفضلة في خطوات بسيطة.",
      cta: "تسوّق المشروبات",
    },
    footer: {
      newsletterEyebrow: "العروض · المنتجات الجديدة · الأخبار",
      newsletterTitle: "ابقَ منتعشاً.",
      newsletterDescription:
        "تابع أحدث العروض والمنتجات الجديدة وأخبار موناداتي.",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "بريدك الإلكتروني",
      newsletterButton: "اشترك",
      brandDescription:
        "مشروبات غازية ومياه وعصائر وأكثر — خيارات كثيرة وأسعار مناسبة وطلب سهل.",
    },
  },
} as const;

export type LandingCopy = (typeof LANDING_COPY)[Language];

export function getLandingCopy(language: Language): LandingCopy {
  return LANDING_COPY[language];
}
