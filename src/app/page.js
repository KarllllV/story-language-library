"use client";

import Link from "next/link";

const storyGroups = [
  {
    id: "rabbit",
    title: "Oliver and the Secret Forest",
    image: "/images/rabbitpic.png",
    emoji: "🐰",
    pages: "10 pages",
    versions: [
      {
        id: "rabbit-en",
        language: "English",
        flag: "🇬🇧",
        level: "A1–A2",
        description:
          "Learn English with Oliver. Listen to the story, click every word for a Czech translation and save vocabulary.",
        href: "/stories/rabbit",
        price: "FREE",
        available: true,
        free: true,
        buttonLabel: "▶ Read for free",
      },
      {
        id: "rabbit-de",
        language: "Deutsch",
        flag: "🇩🇪",
        level: "A1–A2",
        description:
          "Lerne Deutsch mit Oliver. Höre die Geschichte, klicke auf Wörter und speichere neue Vokabeln.",
        href: "/stories/rabbitde",
        price: "FREE",
        available: true,
        free: true,
        buttonLabel: "▶ Kostenlos lesen",
      },
      {
        id: "rabbit-cs",
        language: "Čeština",
        flag: "🇨🇿",
        level: "Pro děti",
        description:
          "Přečti si Oliverův příběh v češtině. Vhodné také jako srovnávací verze k angličtině a němčině.",
        href: "/stories/rabbitcz",
        price: "FREE",
        available: true,
        free: true,
        buttonLabel: "▶ Číst zdarma",
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
        description:
          "Mladý delfín hledá v oceánu kouzelnou modrou perlu.",
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
        description:
          "Malý tučňák cestuje přes led, aby spatřil polární záři.",
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

const features = [
  "🔊 Natural voice",
  "💬 Click words",
  "⭐ Save vocabulary",
  "💾 Continue later",
];

export default function HomePage() {
  function showComingSoon(storyTitle, language, price) {
    const paymentText =
      price === "FREE"
        ? "This language version is being prepared."
        : `This version will cost ${price}. The payment system will be connected later.`;

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
            Learn through stories in three languages
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

          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "20px",
              lineHeight: 1.65,
            }}
          >
            Choose the same story in English, German or Czech. Listen, read,
            compare languages and save new vocabulary.
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
            {["🇬🇧 English to CZ", "🇩🇪 Deutsch to CZ", "🇨🇿 Czech to Russian"].map((item) => (
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
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
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
                        background:
                          story.price === "FREE"
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
                      {story.level} • {group.pages}
                    </p>

                    <h3
                      style={{
                        margin: "0 0 9px",
                        fontSize: "21px",
                        lineHeight: 1.2,
                      }}
                    >
                      {group.title}
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
                      {features.map((feature) => (
                        <div key={feature}>{feature}</div>
                      ))}
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
                        {story.buttonLabel || "▶ Read for free"}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          showComingSoon(
                            group.title,
                            story.language,
                            story.price
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "none",
                          borderRadius: "10px",
                          background:
                            story.price === "FREE" ? "#64748b" : "#2563eb",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        {story.price === "FREE"
                          ? "Coming soon"
                          : `🔒 Read for ${story.price}`}
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
          Story Language Library • English • Deutsch • Čeština
        </footer>
      </section>

      <style jsx global>{`
        @media (max-width: 900px) {
          main section section > div[style*="repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}