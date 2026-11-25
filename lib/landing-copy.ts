import type { Language } from "@/lib/translation-utils";

const LANDING_COPY = {
  fr: {
    hero: {
      eyebrow: "BOISSONS EN GROS POUR LES PROFESSIONNELS",
      title: "VOS BOISSONS EN GROS,\nLIVRÉES À VOTRE COMMERCE.",
      description:
        "Toutes vos boissons en gros, au même endroit. Commandez simplement pour votre commerce.",
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
      eyebrow: "Le catalogue MONADATY",
      title: "Nos boissons en gros",
      description: "Sodas, eaux, jus et plus — tout ce qu’il faut à votre commerce, au même endroit.",
    },
    wishlist: {
      eyebrow: "VOTRE SÉLECTION",
      title: "VOS FAVORIS",
      description: "Gardez les boissons dont votre commerce a besoin sous la main et revenez les commander quand vous voulez.",
    },
    checkout: {
      eyebrow: "PAIEMENT SÉCURISÉ",
      title: "La dernière étape, tout simplement.",
      description: "Vos boissons livrées à votre commerce, à Rabat ou à Salé. Quelques informations suffisent, le paiement se fait à la livraison.",
    },
    about: {
      "metadataTitle": "À propos",
      "eyebrow": "À propos de MONADATY",
      "title": "Votre commerce avance.",
      "titleAccent": "Nous l’approvisionnons.",
      "description": "Épiceries, cafés, restaurants : nous simplifions votre approvisionnement en boissons, du choix du catalogue à la livraison à votre commerce.",
      "imageAlt": "Une sélection de boissons : eau, sodas et jus.",
      "imageCaption": "Les boissons du quotidien, réunies pour les professionnels.",
      "services": [
        "Pour les professionnels",
        "Livraison à Rabat & Salé",
        "Paiement à la livraison"
      ],
      "storyEyebrow": "Notre engagement",
      "storyTitle": "Vous servir, au rythme de votre commerce.",
      "storyDescription": "Un réassort prévu ou un besoin de dernière minute ? Retrouvez vos boissons dans un catalogue clair, choisissez vos quantités et passez commande simplement. Nous nous occupons de vous les livrer.",
      "valuesEyebrow": "L’esprit MONADATY",
      "valuesTitle": "Un quotidien plus simple pour les pros.",
      "values": [
        {
          "title": "Le choix, au même endroit",
          "description": "Eaux, sodas, jus et boissons énergétiques : retrouvez les références utiles à votre commerce."
        },
        {
          "title": "Des prix de gros",
          "description": "Des tarifs et des conditionnements pensés pour les achats des professionnels."
        },
        {
          "title": "Une commande sans détour",
          "description": "Un panier clair, les quantités de votre choix et un paiement à la réception."
        },
        {
          "title": "Un service de proximité",
          "description": "Nous livrons votre commande à l’adresse de votre commerce, à Rabat ou à Salé."
        }
      ],
      "processEyebrow": "Du catalogue à votre porte",
      "processTitle": "Vous commandez. On s’occupe de la suite.",
      "steps": [
        {
          "title": "Choisissez vos boissons",
          "description": "Parcourez les catégories et ajoutez vos références au panier."
        },
        {
          "title": "Confirmez votre commande",
          "description": "Ajustez les quantités et indiquez votre adresse de livraison."
        },
        {
          "title": "Recevez à votre commerce",
          "description": "Votre commande arrive chez vous. Vous réglez à la livraison."
        }
      ],
      "deliveryEyebrow": "Proches de votre commerce",
      "deliveryDescription": "Notre zone de livraison couvre Rabat et Salé. Indiquez simplement l’adresse de votre commerce lors de votre commande.",
      "closingTitle": "Votre prochain réassort commence ici.",
      "closingDescription": "Découvrez les boissons dont votre commerce a besoin et préparez votre prochaine commande.",
      "cta": "Découvrir le catalogue",
      "secondaryCta": "Notre engagement"
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
      title: "WHOLESALE DRINKS,\nDELIVERED TO YOUR BUSINESS.",
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
      eyebrow: "MONADATY catalogue",
      title: "Wholesale drinks",
      description: "Sodas, water, juices and more — everything your business needs, in one place.",
    },
    wishlist: {
      eyebrow: "YOUR SELECTION",
      title: "YOUR FAVORITES",
      description: "Keep the drinks your business relies on close and come back to order them whenever you are ready.",
    },
    checkout: {
      eyebrow: "SECURE CHECKOUT",
      title: "One last step. We’ll take it from here.",
      description: "Your drinks, delivered to your business in Rabat or Salé. Add your details and pay when your order arrives.",
    },
    about: {
      "metadataTitle": "About us",
      "eyebrow": "About MONADATY",
      "title": "Your business moves.",
      "titleAccent": "We keep it stocked.",
      "description": "Grocers, cafés and restaurants: we make restocking drinks simple, from browsing the catalogue to delivery at your business.",
      "imageAlt": "A selection of bottled water, soft drinks and juices.",
      "imageCaption": "Everyday drinks, brought together for businesses.",
      "services": [
        "For professionals",
        "Delivery in Rabat & Salé",
        "Payment on delivery"
      ],
      "storyEyebrow": "Our commitment",
      "storyTitle": "Here for the rhythm of your business.",
      "storyDescription": "Planning your next restock or need a quick top-up? Find your drinks in a clear catalogue, choose your quantities and place your order. We take care of delivery.",
      "valuesEyebrow": "The MONADATY approach",
      "valuesTitle": "Making everyday business a little easier.",
      "values": [
        {
          "title": "The choice, in one place",
          "description": "Water, soft drinks, juices and energy drinks: find the products your business needs."
        },
        {
          "title": "Wholesale prices",
          "description": "Pricing and pack sizes designed for professional purchasing."
        },
        {
          "title": "Straightforward ordering",
          "description": "A clear basket, your chosen quantities and payment when your order arrives."
        },
        {
          "title": "A local service",
          "description": "We deliver your order to your business address in Rabat or Salé."
        }
      ],
      "processEyebrow": "From the catalogue to your door",
      "processTitle": "You place the order. We take it from there.",
      "steps": [
        {
          "title": "Choose your drinks",
          "description": "Browse the categories and add the products you need to your basket."
        },
        {
          "title": "Confirm your order",
          "description": "Adjust the quantities and tell us where to deliver."
        },
        {
          "title": "Receive at your business",
          "description": "Your order arrives at your door. You pay on delivery."
        }
      ],
      "deliveryEyebrow": "Close to your business",
      "deliveryDescription": "We deliver within Rabat and Salé. Simply enter your business address when placing your order.",
      "closingTitle": "Your next restock starts here.",
      "closingDescription": "Explore the drinks your business needs and prepare your next order.",
      "cta": "Explore the catalogue",
      "secondaryCta": "Our commitment"
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
      title: "مشروباتك بالجملة،\nنوصلوها حتى لمحلك.",
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
      eyebrow: "كتالوج موناداتي",
      title: "مشروباتنا بالجملة",
      description: "مشروبات غازية ومياه وعصائر وأكثر — كل ما يحتاجه محلك في مكان واحد.",
    },
    wishlist: {
      eyebrow: "اختياراتك",
      title: "مشروباتك المفضلة",
      description: "احتفظ بالمشروبات التي يحتاجها محلك لتعود وتطلبها متى شئت.",
    },
    checkout: {
      eyebrow: "دفع آمن",
      title: "خطوة أخيرة، والباقي علينا.",
      description: "مشروباتك إلى باب متجرك في الرباط أو سلا. أضف معلومات التوصيل وادفع عند استلام طلبك.",
    },
    about: {
      "metadataTitle": "من نحن",
      "eyebrow": "عن موناداتي",
      "title": "أنت تهتم بمتجرك.",
      "titleAccent": "ونحن نهتم بمشروباتك.",
      "description": "للبقالات والمقاهي والمطاعم: نسهّل تزويد متجرك بالمشروبات، من اختيار المنتجات في الكتالوج إلى توصيلها إلى باب محلك.",
      "imageAlt": "تشكيلة من قنينات المياه والمشروبات الغازية والعصائر.",
      "imageCaption": "مشروبات يومية، جمعناها لتلبية احتياجات المهنيين.",
      "services": [
        "خاص بالمهنيين",
        "التوصيل إلى الرباط وسلا",
        "الدفع عند الاستلام"
      ],
      "storyEyebrow": "التزامنا",
      "storyTitle": "إلى جانبك، بإيقاع متجرك.",
      "storyDescription": "تخطط لتجديد مخزونك أم تحتاج إلى تزويد سريع؟ اعثر على مشروباتك في كتالوج واضح، حدّد الكميات وأكّد طلبك بسهولة. ونحن نتكفل بالتوصيل.",
      "valuesEyebrow": "روح موناداتي",
      "valuesTitle": "لتصبح إدارة احتياجاتك اليومية أسهل.",
      "values": [
        {
          "title": "خياراتك في مكان واحد",
          "description": "مياه ومشروبات غازية وعصائر ومشروبات طاقة: تشكيلة تلبي احتياجات متجرك."
        },
        {
          "title": "أسعار الجملة",
          "description": "أسعار وعبوات مصممة لتناسب مشتريات المهنيين."
        },
        {
          "title": "طلب بكل بساطة",
          "description": "سلة واضحة، وكميات تختارها بنفسك، ودفع عند استلام الطلب."
        },
        {
          "title": "خدمة قريبة منك",
          "description": "نوصل طلبك إلى عنوان متجرك داخل مدينتي الرباط وسلا."
        }
      ],
      "processEyebrow": "من الكتالوج إلى باب متجرك",
      "processTitle": "اختر مشروباتك، واترك الباقي علينا.",
      "steps": [
        {
          "title": "اختر مشروباتك",
          "description": "تصفّح الفئات وأضف المنتجات التي تحتاجها إلى سلتك."
        },
        {
          "title": "أكّد طلبك",
          "description": "حدّد الكميات وأدخل عنوان توصيل الطلب."
        },
        {
          "title": "استلم في متجرك",
          "description": "تصلك الطلبية إلى باب محلك، وتدفع عند الاستلام."
        }
      ],
      "deliveryEyebrow": "قريبون من متجرك",
      "deliveryDescription": "تشمل منطقة التوصيل مدينتي الرباط وسلا. يكفي إدخال عنوان متجرك عند إتمام طلبك.",
      "closingTitle": "تجديد مخزونك يبدأ من هنا.",
      "closingDescription": "اكتشف المشروبات التي يحتاجها متجرك وجهّز طلبك المقبل.",
      "cta": "تصفّح الكتالوج",
      "secondaryCta": "التزامنا"
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
