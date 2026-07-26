"use client";

import Link from "next/link";

const originalStoryGroups = [
  {
    id: "rabbit",
    title: "Oliver a tajemný les",
    image: "/images/rabbitpic.png",
    emoji: "🐰",
    pages: "10 stran",

    versions: [
      {
        id: "rabbit-en",
        title: "Oliver a tajemný les",
        language: "Angličtina",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "Učte se anglicky s Oliverem. Poslouchejte příběh, kliknutím na neznámé slovíčko zobrazte jeho český překlad a uložte si ho do svého slovníku.",
        href: "/stories/rabbit",
        price: "Zdarma",
        available: true,
        free: true,
        buttonLabel: "▶ Číst zdarma",
      },
      {
        id: "rabbit-de",
        title: "Oliver a tajemný les",
        language: "Němčina",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Učte se německy s Oliverem. Poslouchejte příběh, kliknutím na neznámé slovíčko zobrazte jeho český překlad a uložte si ho do svého slovníku.",
        href: "/stories/rabbitde",
        price: "Zdarma",
        available: true,
        free: true,
        buttonLabel: "▶ Číst zdarma",
      },
      {
        id: "rabbit-cs",
        title: "Оливер и таинственный лес",
        language: "Чешский язык",
        flag: "🇨🇿",
        level: "A1–A2",
        description:
          "Изучайте чешский язык вместе с Оливером. Слушайте рассказ, нажимайте на незнакомые слова, чтобы увидеть их перевод на русский язык, и сохраняйте их в свой словарь.",
        href: "/stories/rabbitcz",
        price: "Бесплатно",
        available: true,
        free: true,
        buttonLabel: "▶ Читать бесплатно",
      },
    ],
  },
  {
    id: "horse",
    title: "The Brave Horse",
    image: "",
    emoji: "🐴",
    pages: "25+ pages",
    versions: [
      {
        id: "horse-en",
        language: "English",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "A longer English adventure about courage, friendship and a brave horse.",
        href: "/stories/horse",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "horse-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Ein längeres deutsches Abenteuer über Mut, Freundschaft und ein tapferes Pferd.",
        href: "/stories/horse-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "horse-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "Pro děti",
        description:
          "Delší české dobrodružství o odvaze, přátelství a statečném koni.",
        href: "/stories/horse-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },

  {
    id: "fox",
    title: "The Clever Fox",
    image: "",
    emoji: "🦊",
    pages: "18 pages",
    versions: [
      {
        id: "fox-en",
        language: "English",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "A clever fox helps the forest animals solve a mysterious problem.",
        href: "/stories/fox",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "fox-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Ein kluger Fuchs hilft den Waldtieren, ein geheimnisvolles Problem zu lösen.",
        href: "/stories/fox-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "fox-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A1–A2",
        description:
          "Chytrá liška pomáhá lesním zvířatům vyřešit tajemný problém.",
        href: "/stories/fox-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "bear",
    title: "The Bear and the Lost Star",
    image: "",
    emoji: "🐻",
    pages: "20 pages",
    versions: [
      {
        id: "bear-en",
        language: "English",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "A gentle bear searches for a fallen star and discovers an unexpected friendship.",
        href: "/stories/bear",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "bear-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Ein freundlicher Bär sucht nach einem gefallenen Stern und findet eine unerwartete Freundschaft.",
        href: "/stories/bear-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "bear-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A1–A2",
        description:
          "Hodný medvěd hledá spadlou hvězdu a objeví nečekané přátelství.",
        href: "/stories/bear-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "owl",
    title: "The Wise Owl",
    image: "",
    emoji: "🦉",
    pages: "16 pages",
    versions: [
      {
        id: "owl-en",
        language: "English",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "A wise owl teaches young animals how patience can solve difficult problems.",
        href: "/stories/owl",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "owl-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Eine weise Eule zeigt jungen Tieren, wie Geduld schwierige Probleme lösen kann.",
        href: "/stories/owl-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "owl-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A1–A2",
        description:
          "Moudrá sova učí mladá zvířata, že trpělivost dokáže vyřešit těžké problémy.",
        href: "/stories/owl-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "dog",
    title: "The Little Dog's Journey",
    image: "",
    emoji: "🐶",
    pages: "22 pages",
    versions: [
      {
        id: "dog-en",
        language: "English",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "A little dog leaves home for one day and learns what courage really means.",
        href: "/stories/dog",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "dog-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Ein kleiner Hund verlässt für einen Tag sein Zuhause und lernt, was Mut bedeutet.",
        href: "/stories/dog-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "dog-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A1–A2",
        description:
          "Malý pejsek se vydá na jednodenní cestu a pozná, co skutečně znamená odvaha.",
        href: "/stories/dog-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "cat",
    title: "The Cat in the Clock Tower",
    image: "",
    emoji: "🐱",
    pages: "24 pages",
    versions: [
      {
        id: "cat-en",
        language: "English",
        flag: "🇬🇧",
        level: "A2",
        description:
          "A curious cat enters an old clock tower and uncovers a forgotten secret.",
        href: "/stories/cat",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "cat-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A2",
        description:
          "Eine neugierige Katze betritt einen alten Uhrturm und entdeckt ein vergessenes Geheimnis.",
        href: "/stories/cat-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "cat-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A2",
        description:
          "Zvědavá kočka vstoupí do staré hodinové věže a odhalí zapomenuté tajemství.",
        href: "/stories/cat-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "dragon",
    title: "The Friendly Dragon",
    image: "",
    emoji: "🐉",
    pages: "28 pages",
    versions: [
      {
        id: "dragon-en",
        language: "English",
        flag: "🇬🇧",
        level: "A2",
        description:
          "A young dragon wants to make friends, but everyone is afraid of him.",
        href: "/stories/dragon",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "dragon-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A2",
        description:
          "Ein junger Drache möchte Freunde finden, doch alle haben Angst vor ihm.",
        href: "/stories/dragon-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "dragon-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A2",
        description:
          "Mladý drak si chce najít přátele, ale všichni se ho bojí.",
        href: "/stories/dragon-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "dolphin",
    title: "The Dolphin and the Blue Pearl",
    image: "",
    emoji: "🐬",
    pages: "21 pages",
    versions: [
      {
        id: "dolphin-en",
        language: "English",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "A young dolphin searches the ocean for a magical blue pearl.",
        href: "/stories/dolphin",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "dolphin-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Ein junger Delfin sucht im Meer nach einer magischen blauen Perle.",
        href: "/stories/dolphin-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "dolphin-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A1–A2",
        description: "Mladý delfín hledá v oceánu kouzelnou modrou perlu.",
        href: "/stories/dolphin-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "elephant",
    title: "The Elephant Who Remembered",
    image: "",
    emoji: "🐘",
    pages: "19 pages",
    versions: [
      {
        id: "elephant-en",
        language: "English",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "An old elephant uses his memories to guide his family through a difficult journey.",
        href: "/stories/elephant",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "elephant-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Ein alter Elefant nutzt seine Erinnerungen, um seine Familie auf einer schwierigen Reise zu führen.",
        href: "/stories/elephant-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "elephant-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A1–A2",
        description:
          "Starý slon využije své vzpomínky, aby provedl rodinu náročnou cestou.",
        href: "/stories/elephant-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "penguin",
    title: "The Penguin and the Northern Light",
    image: "",
    emoji: "🐧",
    pages: "23 pages",
    versions: [
      {
        id: "penguin-en",
        language: "English",
        flag: "🇬🇧",
        level: "A2",
        description:
          "A small penguin travels across the ice to see the northern lights.",
        href: "/stories/penguin",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "penguin-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A2",
        description:
          "Ein kleiner Pinguin reist über das Eis, um das Nordlicht zu sehen.",
        href: "/stories/penguin-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "penguin-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A2",
        description: "Malý tučňák cestuje přes led, aby spatřil polární záři.",
        href: "/stories/penguin-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
  {
    id: "lion",
    title: "The Lion Without a Roar",
    image: "",
    emoji: "🦁",
    pages: "26 pages",
    versions: [
      {
        id: "lion-en",
        language: "English",
        flag: "🇬🇧",
        level: "A2",
        description:
          "A young lion loses his roar and learns that true strength comes from within.",
        href: "/stories/lion",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "lion-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A2",
        description:
          "Ein junger Löwe verliert sein Brüllen und lernt, dass wahre Stärke von innen kommt.",
        href: "/stories/lion-de",
        price: "€0.99",
        available: false,
        free: false,
      },
      {
        id: "lion-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "A2",
        description:
          "Mladý lev ztratí svůj řev a zjistí, že skutečná síla vychází zevnitř.",
        href: "/stories/lion-cs",
        price: "€0.99",
        available: false,
        free: false,
      },
    ],
  },
];

const localizedStories = {
  rabbit: {
    titleCs: "Oliver a tajemný les",
    titleRu: "Оливер и таинственный лес",
    pagesCs: "10 stran",
    pagesRu: "10 страниц",
    descriptionCs:
      "Oliver se vydává do tajemného lesa a zažívá nečekané dobrodružství.",
    descriptionRu:
      "Оливер отправляется в таинственный лес, где его ждёт неожиданное приключение.",
  },
  horse: {
    titleCs: "Statečný kůň",
    titleRu: "Храбрый конь",
    pagesCs: "Více než 25 stran",
    pagesRu: "Более 25 страниц",
    descriptionCs:
      "Delší dobrodružný příběh o odvaze, přátelství a statečném koni.",
    descriptionRu: "Увлекательная история о смелости, дружбе и храбром коне.",
  },
  fox: {
    titleCs: "Chytrá liška",
    titleRu: "Хитрая лиса",
    pagesCs: "18 stran",
    pagesRu: "18 страниц",
    descriptionCs:
      "Chytrá liška pomáhá lesním zvířatům vyřešit záhadný problém.",
    descriptionRu:
      "Хитрая лиса помогает лесным животным решить загадочную проблему.",
  },
  bear: {
    titleCs: "Medvěd a ztracená hvězda",
    titleRu: "Медведь и потерянная звезда",
    pagesCs: "20 stran",
    pagesRu: "20 страниц",
    descriptionCs:
      "Laskavý medvěd hledá spadlou hvězdu a objeví nečekané přátelství.",
    descriptionRu:
      "Добрый медведь ищет упавшую звезду и обретает неожиданную дружбу.",
  },
  owl: {
    titleCs: "Moudrá sova",
    titleRu: "Мудрая сова",
    pagesCs: "16 stran",
    pagesRu: "16 страниц",
    descriptionCs:
      "Moudrá sova učí mladá zvířata, že trpělivost pomáhá řešit složité problémy.",
    descriptionRu:
      "Мудрая сова учит молодых животных решать сложные проблемы с помощью терпения.",
  },
  dog: {
    titleCs: "Cesta malého pejska",
    titleRu: "Путешествие маленькой собаки",
    pagesCs: "22 stran",
    pagesRu: "22 страницы",
    descriptionCs:
      "Malý pejsek se vydá na cestu a pozná, co skutečně znamená odvaha.",
    descriptionRu:
      "Маленькая собака отправляется в путешествие и узнаёт, что такое настоящая смелость.",
  },
  cat: {
    titleCs: "Kočka v hodinové věži",
    titleRu: "Кошка в часовой башне",
    pagesCs: "24 stran",
    pagesRu: "24 страницы",
    descriptionCs:
      "Zvědavá kočka vstoupí do staré hodinové věže a odhalí zapomenuté tajemství.",
    descriptionRu:
      "Любопытная кошка входит в старую часовую башню и раскрывает забытую тайну.",
  },
  dragon: {
    titleCs: "Přátelský drak",
    titleRu: "Дружелюбный дракон",
    pagesCs: "28 stran",
    pagesRu: "28 страниц",
    descriptionCs: "Mladý drak si chce najít přátele, ale všichni se ho bojí.",
    descriptionRu: "Молодой дракон хочет найти друзей, но все его боятся.",
  },
  dolphin: {
    titleCs: "Delfín a modrá perla",
    titleRu: "Дельфин и голубая жемчужина",
    pagesCs: "21 stran",
    pagesRu: "21 страница",
    descriptionCs: "Mladý delfín hledá v oceánu kouzelnou modrou perlu.",
    descriptionRu: "Молодой дельфин ищет в океане волшебную голубую жемчужину.",
  },
  elephant: {
    titleCs: "Slon, který nezapomněl",
    titleRu: "Слон, который всё помнил",
    pagesCs: "19 stran",
    pagesRu: "19 страниц",
    descriptionCs:
      "Starý slon využije své vzpomínky, aby provedl rodinu náročnou cestou.",
    descriptionRu:
      "Старый слон использует свои воспоминания, чтобы провести семью через трудное путешествие.",
  },
  penguin: {
    titleCs: "Tučňák a polární záře",
    titleRu: "Пингвин и северное сияние",
    pagesCs: "23 stran",
    pagesRu: "23 страницы",
    descriptionCs: "Malý tučňák cestuje přes led, aby spatřil polární záři.",
    descriptionRu:
      "Маленький пингвин путешествует по льду, чтобы увидеть северное сияние.",
  },
  lion: {
    titleCs: "Lev bez řevu",
    titleRu: "Лев без рыка",
    pagesCs: "26 stran",
    pagesRu: "26 страниц",
    descriptionCs:
      "Mladý lev ztratí svůj řev a zjistí, že skutečná síla vychází zevnitř.",
    descriptionRu:
      "Молодой лев теряет свой рык и узнаёт, что настоящая сила находится внутри.",
  },
};

const storyGroups = originalStoryGroups.map((group) => {
  const text = localizedStories[group.id];

  return {
    ...group,
    title: text.titleCs,
    pages: text.pagesCs,
    versions: group.versions.map((story) => {
      const isRussianCard = story.id.endsWith("-cs");
      const isGermanCard = story.id.endsWith("-de");

      return {
        ...story,
        title: isRussianCard ? text.titleRu : text.titleCs,
        pages: isRussianCard ? text.pagesRu : text.pagesCs,
        language: isRussianCard
          ? "Чешский язык"
          : isGermanCard
            ? "Němčina"
            : "Angličtina",
        description: isRussianCard
          ? `${text.descriptionRu} Слушайте рассказ, нажимайте на незнакомые слова, чтобы увидеть их перевод на русский язык, и сохраняйте их в свой словарь.`
          : `${text.descriptionCs} Poslouchejte příběh, kliknutím na neznámé slovíčko zobrazte jeho český překlad a uložte si ho do svého slovníku.`,
        price: story.free
          ? isRussianCard
            ? "Бесплатно"
            : "Zdarma"
          : story.price,
        buttonLabel: story.free
          ? isRussianCard
            ? "▶ Читать бесплатно"
            : "▶ Číst zdarma"
          : undefined,
      };
    }),
  };
});

const featuresCs = [
  "🔊 Přirozený hlas",
  "💬 Klikání na slovíčka",
  "⭐ Ukládání slovíček do slovníku",
  "💾 Ukládání na později",
];

const featuresRu = [
  "🔊 Естественный голос",
  "💬 Нажимайте на слова",
  "⭐ Сохраняйте слова в словарь",
  "💾 Продолжайте позже",
];

export default function HomePage() {
  function showComingSoon(storyTitle, language, price, isRussianCard) {
    const paymentText = isRussianCard
      ? `Эта история готовится. После запуска она будет стоить ${price}. Платёжная система будет добавлена позже.`
      : `Tento příběh se připravuje. Po spuštění bude stát ${price}. Platební systém bude doplněn později.`;

    window.alert(`${storyTitle} — ${language}\n\n${paymentText}`);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef7ff 0%, #f7f4ff 52%, #fff7ed 100%)",
        fontFamily: "Arial, sans-serif",
        color: "#172033",
      }}
    >
      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "48px 20px 36px",
        }}
      >
        <header
          style={{
            maxWidth: "820px",
            margin: "0 auto 42px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#2563eb",
              fontSize: "17px",
              fontWeight: "700",
            }}
          >
            Učte se cizí jazyky prostřednictvím příběhů
          </p>

          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(40px, 6vw, 68px)",
              lineHeight: 1.03,
              letterSpacing: "-0.04em",
            }}
          >
            🌍 Ing. Karl Story Language Library
          </h1>

          <img
            src="/images/newlogo.jpg"
            alt="Ing. Karl Story Language Library logo"
            style={{
              display: "block",
              width: "100%",
              maxWidth: "420px",
              height: "auto",
              margin: "0 auto 24px",
              borderRadius: "20px",
              boxShadow: "0 16px 38px rgba(15, 23, 42, 0.14)",
              objectFit: "cover",
            }}
          />

          <section
            style={{
              maxWidth: "680px",
              margin: "0 auto 28px",
              padding: "24px",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.92)",
              border: "1px solid #dbe3ee",
              boxShadow: "0 14px 36px rgba(15,23,42,0.10)",
              textAlign: "left",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <h2
                style={{
                  margin: "0 0 7px",
                  color: "#172033",
                  fontSize: "25px",
                  lineHeight: 1.2,
                }}
              >
                ✉️ kontaktuj Ing. Karl a jeho vývojové studio
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "15px",
                  lineHeight: 1.55,
                }}
              >
                Máte nápad nebo vlastní přání? Pošlete mi svůj dotaz, připomínku
                nebo námět na nový příběh. Na přání vám mohu vytvořit originální
                příběh podle vašeho tématu, upravit jeho obtížnost, délku či
                jazykovou verzi nebo doplnit funkce, které by vám při studiu
                pomohly. Aplikace je stále ve vývoji, proto uvítám také vaše
                zkušenosti a návrhy na její vylepšení. Vaše zpětná vazba může
                ovlivnit její další podobu a pomoci vytvořit užitečnější nástroj
                pro výuku cizích jazyků.
              </p>
            </div>

            <form
              action="https://formspree.io/f/xpqvddgk"
              method="POST"
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              <input
                type="hidden"
                name="_subject"
                value="New message from Story Language Library"
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "12px",
                }}
                className="contact-two-columns"
              >
                <label
                  style={{
                    display: "grid",
                    gap: "6px",
                    color: "#334155",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  Tvoje jméno
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="jméno"
                    style={{
                      width: "100%",
                      padding: "12px 13px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "11px",
                      background: "white",
                      color: "#172033",
                      fontSize: "15px",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "grid",
                    gap: "6px",
                    color: "#334155",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  Tvůj email
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jméno@email.cz"
                    style={{
                      width: "100%",
                      padding: "12px 13px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "11px",
                      background: "white",
                      color: "#172033",
                      fontSize: "15px",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </label>
              </div>

              <label
                style={{
                  display: "grid",
                  gap: "6px",
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                Napiš mi tvoji zprávu
                <select
                  name="requestType"
                  defaultValue="Question"
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "11px",
                    background: "white",
                    color: "#172033",
                    fontSize: "15px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                >
                  <option value="Question">Otázka</option>
                  <option value="New story request">
                    Požadavek na nový příběh
                  </option>
                  <option value="Technical problem">Technický problém</option>
                  <option value="Cooperation">Spolupráce</option>
                  <option value="Other">Další</option>
                </select>
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "6px",
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                Zpráva
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="napiš svoji zprávu nebo otázku sem..."
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "11px",
                    background: "white",
                    color: "#172033",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    resize: "vertical",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9px",
                  color: "#64748b",
                  fontSize: "12px",
                  lineHeight: 1.45,
                }}
              >
                <input
                  type="checkbox"
                  name="privacyConsent"
                  value="Agreed"
                  required
                  style={{ marginTop: "2px" }}
                />
                Souhlasím že moje informace budou použity k odpovědi na vaši
                otázku nebo požadavek.
              </label>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  border: "none",
                  borderRadius: "11px",
                  background: "#2563eb",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
                }}
              >
                ✉️ Odeslat zprávu
              </button>
            </form>
          </section>

          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "20px",
              lineHeight: 1.65,
            }}
          >
            Vyberte si stejný příběh v angličtině, němčině nebo češtině.
            Poslouchejte jeho výslovnost, čtěte, porovnávejte jednotlivé jazyky
            a ukládejte si nová slovíčka. Aplikace vám může celý text nahlas
            předčítat a zároveň zvýrazňuje právě čtená slova, takže můžete
            poslouchat správnou výslovnost a současně sledovat text. Pokud
            narazíte na slovíčko, kterému nerozumíte, jednoduše na něj klikněte
            a ihned se zobrazí jeho překlad. Slovíčko si můžete znovu nechat
            vyslovit nebo si ho uložit do vlastního slovníku, abyste se k němu
            mohli později vrátit. Díky propojení příběhů, poslechu, překladu a
            vlastního slovníku si můžete rozšiřovat slovní zásobu a učit se cizí
            jazyky přirozeným, jednoduchým a zábavným způsobem.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "24px",
            }}
          >
            {[
              "🇬🇧 Angličtina → čeština",
              "🇩🇪 Němčina → čeština",
              "🇨🇿 Čeština → ruština",
            ].map((item) => (
              <span
                key={item}
                style={{
                  padding: "10px 15px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.82)",
                  border: "1px solid #dbe3ee",
                  color: "#334155",
                  fontWeight: "700",
                  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </header>

        {storyGroups.map((group, groupIndex) => (
          <section
            key={group.id}
            style={{
              marginBottom: groupIndex === storyGroups.length - 1 ? 0 : "46px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  background: "white",
                  fontSize: "28px",
                  boxShadow: "0 8px 22px rgba(15,23,42,0.08)",
                }}
              >
                {group.emoji}
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 3px",
                    color: "#2563eb",
                    fontSize: "14px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {group.pages}
                </p>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "30px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {group.title}
                </h2>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              {group.versions.map((story) => (
                <article
                  key={story.id}
                  style={{
                    overflow: "hidden",
                    borderRadius: "20px",
                    background: "white",
                    boxShadow: "0 12px 32px rgba(15,23,42,0.09)",
                    border: "1px solid rgba(226,232,240,0.9)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: "175px",
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, #dbeafe 0%, #fef3c7 100%)",
                    }}
                  >
                    {group.image ? (
                      <img
                        src={group.image}
                        alt={`${group.title} — ${story.language}`}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "82px",
                        }}
                      >
                        {group.emoji}
                      </div>
                    )}

                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        padding: "7px 10px",
                        borderRadius: "999px",
                        background: "rgba(15,23,42,0.82)",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {story.flag} {story.language}
                    </span>

                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        padding: "7px 10px",
                        borderRadius: "999px",
                        background: story.free
                          ? "rgba(22,163,74,0.94)"
                          : "rgba(37,99,235,0.94)",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {story.price}
                    </span>
                  </div>

                  <div style={{ padding: "18px" }}>
                    <p
                      style={{
                        margin: "0 0 7px",
                        color: "#2563eb",
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {story.level} • {story.pages}
                    </p>

                    <h3
                      style={{
                        margin: "0 0 9px",
                        fontSize: "21px",
                        lineHeight: 1.2,
                      }}
                    >
                      {story.title}
                    </h3>

                    <p
                      style={{
                        minHeight: "88px",
                        margin: "0 0 14px",
                        color: "#64748b",
                        fontSize: "14px",
                        lineHeight: 1.55,
                      }}
                    >
                      {story.description}
                    </p>

                    <div
                      style={{
                        marginBottom: "15px",
                        padding: "11px",
                        borderRadius: "11px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                        fontSize: "12px",
                        lineHeight: 1.7,
                      }}
                    >
                      {(story.id.endsWith("-cs") ? featuresRu : featuresCs).map(
                        (feature) => (
                          <div key={feature}>{feature}</div>
                        ),
                      )}
                    </div>

                    {story.available ? (
                      <Link
                        href={story.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "10px",
                          background: "#16a34a",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "700",
                          textDecoration: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        {story.buttonLabel || "▶ Číst zdarma"}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          showComingSoon(
                            story.title,
                            story.language,
                            story.price,
                            story.id.endsWith("-cs"),
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "none",
                          borderRadius: "10px",
                          background: story.free ? "#64748b" : "#2563eb",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        {story.id.endsWith("-cs")
                          ? story.free
                            ? "Скоро"
                            : `🔒 Читать за ${story.price}`
                          : story.free
                            ? "Již brzy"
                            : `🔒 Číst za ${story.price}`}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <footer
          style={{
            marginTop: "48px",
            padding: "22px 0",
            borderTop: "1px solid rgba(148,163,184,0.35)",
            color: "#64748b",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          Story Language Library • Angličtina • Němčina • Čeština
        </footer>
      </section>

      <style jsx global>{`
        @media (max-width: 900px) {
          main section section > div[style*="repeat(3"] {
            grid-template-columns: 1fr !important;
          }

          .contact-two-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}