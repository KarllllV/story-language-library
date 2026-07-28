"use client";

import Link from "next/link";
import { useState } from "react";

const availableStories = [
  {
    id: "rabbit",
    title: "Oliver a tajemný les",
    image: "/images/rabbitpic.png",
    emoji: "🐰",
    pages: "10 stran",
    level: "A1–A2",
    description:
      "Oliver se vydává do tajemného lesa, kde ho čeká dobrodružství plné odvahy, přátelství a nečekaných setkání.",
    languages: [
      {
        id: "rabbit-en",
        label: "Angličtina",
        flag: "🇬🇧",
        href: "/stories/rabbit",
      },
      {
        id: "rabbit-de",
        label: "Němčina",
        flag: "🇩🇪",
        href: "/stories/rabbitde",
      },
      {
        id: "rabbit-cs",
        label: "Čeština → ruština",
        flag: "🇨🇿",
        href: "/stories/rabbitcz",
      },
    ],
  },
  {
    id: "horse",
    title: "Statečný kůň",
    image: "/images/horse1.png",
    emoji: "🐴",
    pages: "30 stran",
    level: "A1–A2",
    description:
      "Mladý kůň Jantar musí překonat svůj strach a vydat se přes nebezpečné hory pro pomoc, aby zachránil Podlesí před povodní.",
    languages: [
      {
        id: "horse-en",
        label: "Angličtina",
        flag: "🇬🇧",
        href: "/stories/horse",
      },
      {
        id: "horse-de",
        label: "Němčina",
        flag: "🇩🇪",
        href: "/stories/horsede",
      },
      {
        id: "horse-cs",
        label: "Čeština → ruština",
        flag: "🇨🇿",
        href: "/stories/horsecz",
      },
    ],
  },
  {
    id: "fox",
    title: "Chytrá liška a tajemství Stříbrného pramene",
    image: "/images/foxpic.png",
    emoji: "🦊",
    pages: "30 stran",
    level: "A1–A2",
    description:
      "Liška Ryška pátrá po příčině mizející vody a díky důvtipu, odvaze a přátelství pomůže zachránit celý les.",
    languages: [
      {
        id: "fox-en",
        label: "Angličtina",
        flag: "🇬🇧",
        href: "/stories/fox",
      },
      {
        id: "fox-de",
        label: "Němčina",
        flag: "🇩🇪",
        href: "/stories/foxde",
      },
      {
        id: "fox-cs",
        label: "Čeština → ruština",
        flag: "🇨🇿",
        href: "/stories/foxcz",
      },
    ],
  },
];

const storyIdeas = [
  {
    emoji: "🐻",
    title: "Medvěd a ztracená hvězda",
    description: "Příběh o přátelství, odvaze a cestě za světlem.",
  },
  {
    emoji: "🦉",
    title: "Moudrá sova",
    description: "Dobrodružství, ve kterém trpělivost pomůže vyřešit záhadu.",
  },
  {
    emoji: "🐉",
    title: "Přátelský drak",
    description: "Mladý drak hledá přátele ve světě, který se ho bojí.",
  },
  {
    emoji: "🐶",
    title: "Cesta malého pejska",
    description: "Výprava za poznáním toho, co skutečně znamená odvaha.",
  },
  {
    emoji: "🐬",
    title: "Delfín a modrá perla",
    description: "Kouzelné dobrodružství v hlubinách oceánu.",
  },
  {
    emoji: "✨",
    title: "Vlastní námět",
    description: "Vaše téma, postavy, prostředí i jazyková kombinace.",
  },
];

const benefits = [
  "Příběh podle vašeho tématu a představ",
  "Volba obtížnosti, délky a cílové skupiny",
  "Angličtina, němčina, čeština nebo jiný jazyk",
  "Poslech, klikací překlady a vlastní slovníček",
];

export default function StoriesPage() {
  const [selectedTheme, setSelectedTheme] = useState("Vlastní námět");
  const [formStatus, setFormStatus] = useState("idle");
  const [formMessage, setFormMessage] = useState("");

  function chooseTheme(theme) {
    setSelectedTheme(theme);

    window.setTimeout(() => {
      document
        .getElementById("objednat-pribeh")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.append(
      "_subject",
      `Nová poptávka příběhu: ${formData.get("tema")}`,
    );

    setFormStatus("sending");
    setFormMessage("");

    try {
      const response = await fetch("https://formspree.io/f/xpqvddgk", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Formulář se nepodařilo odeslat.");
      }

      form.reset();
      setSelectedTheme("Vlastní námět");
      setFormStatus("success");
      setFormMessage(
        "Děkuji! Vaše poptávka byla odeslána. Ozvu se vám na uvedený kontakt.",
      );
    } catch {
      setFormStatus("error");
      setFormMessage(
        "Poptávku se nepodařilo odeslat. Zkontrolujte připojení a zkuste to prosím znovu.",
      );
    }
  }

  return (
    <main className="storiesPage">
      <section className="pageShell">
        <Link href="/" className="backLink">
          ← Zpět na hlavní stránku
        </Link>

        <header className="hero">
          <p className="eyebrow">Interaktivní jazykové příběhy</p>

          <h1>Učte se jazyky prostřednictvím příběhů</h1>

          <p className="heroText">
            Čtěte, poslouchejte správnou výslovnost, překládejte slovíčka
            kliknutím a ukládejte si je do vlastního slovníku.
          </p>

          <div className="heroBadges">
            <span>3 příběhy zdarma</span>
            <span>3 jazykové varianty</span>
            <span>Úroveň A1–A2</span>
          </div>
        </header>

        <section aria-labelledby="available-stories">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Můžete začít hned</p>
              <h2 id="available-stories">Vyberte si příběh</h2>
            </div>

            <p>Všechny dostupné příběhy jsou zdarma.</p>
          </div>

          <div className="storyGrid">
            {availableStories.map((story) => (
              <article className="storyCard" key={story.id}>
                <div className="storyImage">
                  <img src={story.image} alt="" />
                  <span className="freeBadge">Zdarma</span>
                  <span className="storyEmoji" aria-hidden="true">
                    {story.emoji}
                  </span>
                </div>

                <div className="storyContent">
                  <p className="storyMeta">
                    {story.level} <span>•</span> {story.pages}
                  </p>

                  <h3>{story.title}</h3>
                  <p className="storyDescription">{story.description}</p>

                  <p className="chooseLanguage">Vyberte jazyk příběhu:</p>

                  <div className="languageLinks">
                    {story.languages.map((language) => (
                      <Link href={language.href} key={language.id}>
                        <span aria-hidden="true">{language.flag}</span>
                        {language.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="customStory" aria-labelledby="custom-story-title">
          <div className="customStoryText">
            <p className="eyebrow lightEyebrow">Příběh vytvořený pro vás</p>
            <h2 id="custom-story-title">
              Nenašli jste téma nebo jazyk, který hledáte?
            </h2>
            <p>
              Vytvořím vám nový interaktivní příběh na přání. Může být pro vás,
              vaše dítě, studenty nebo celou školní třídu. Společně domluvíme
              téma, postavy, jazyk, úroveň i rozsah.
            </p>

            <ul>
              {benefits.map((benefit) => (
                <li key={benefit}>
                  <span aria-hidden="true">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>

            <a href="#objednat-pribeh" className="primaryCta">
              Nezávazně poptat vlastní příběh
            </a>
          </div>

          <div className="customStoryVisual" aria-hidden="true">
            <span>📖</span>
            <strong>Váš nápad</strong>
            <i>+</i>
            <span>🌍</span>
            <strong>Vybraný jazyk</strong>
            <i>=</i>
            <span>✨</span>
            <strong>Váš příběh</strong>
          </div>
        </section>

        <section className="ideasSection" aria-labelledby="ideas-title">
          <div className="centerHeading">
            <p className="eyebrow">Inspirace pro váš příběh</p>
            <h2 id="ideas-title">Vyberte námět, nebo navrhněte vlastní</h2>
            <p>
              Toto jsou pouze příklady. Příběh můžeme společně vymyslet úplně od
              začátku.
            </p>
          </div>

          <div className="ideasGrid">
            {storyIdeas.map((idea) => (
              <article className="ideaCard" key={idea.title}>
                <span className="ideaEmoji" aria-hidden="true">
                  {idea.emoji}
                </span>
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
                <button type="button" onClick={() => chooseTheme(idea.title)}>
                  {idea.title === "Vlastní námět"
                    ? "Popsat vlastní námět"
                    : "Poptat tento námět"}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          className="orderSection"
          id="objednat-pribeh"
          aria-labelledby="order-title"
        >
          <div className="orderIntro">
            <p className="eyebrow">Nezávazná poptávka</p>
            <h2 id="order-title">Jaký příběh si přejete?</h2>
            <p>
              Napište mi svou představu. Po odeslání se vám ozvu na uvedený
              kontakt a společně domluvíme obsah, jazykové varianty, termín a
              cenu. Odesláním formuláře vám nevzniká žádný závazek.
            </p>

            <div className="orderSteps">
              <div>
                <span>1</span>
                <p>
                  <strong>Pošlete představu</strong>
                  Stačí i několik vět.
                </p>
              </div>
              <div>
                <span>2</span>
                <p>
                  <strong>Domluvíme podrobnosti</strong>
                  Upřesníme rozsah a cenu.
                </p>
              </div>
              <div>
                <span>3</span>
                <p>
                  <strong>Vytvořím příběh</strong>
                  Podle naší dohody.
                </p>
              </div>
            </div>
          </div>

          <form
            className="orderForm"
            action="https://formspree.io/f/xpqvddgk"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div className="formRow">
              <label>
                Jméno *
                <input
                  type="text"
                  name="jmeno"
                  autoComplete="name"
                  placeholder="Vaše jméno"
                  required
                />
              </label>

              <label>
                E-mail *
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="vas@email.cz"
                  required
                />
              </label>
            </div>

            <label>
              Vybraný námět
              <select
                name="tema"
                value={selectedTheme}
                onChange={(event) => setSelectedTheme(event.target.value)}
              >
                {storyIdeas.map((idea) => (
                  <option key={idea.title} value={idea.title}>
                    {idea.emoji} {idea.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Jaký příběh si představujete? *
              <textarea
                name="predstava"
                rows="5"
                placeholder="Napište téma, postavy, prostředí, pro koho má příběh být a cokoli dalšího, co je pro vás důležité."
                required
              />
            </label>

            <div className="formRow">
              <label>
                Jazyk nebo jazykové varianty
                <input
                  type="text"
                  name="jazyky"
                  placeholder="Např. angličtina a němčina"
                />
              </label>

              <label>
                Pro koho má příběh být?
                <select name="cilova_skupina" defaultValue="">
                  <option value="" disabled>
                    Vyberte možnost
                  </option>
                  <option>Dítě</option>
                  <option>Dospělý student</option>
                  <option>Školní třída</option>
                  <option>Rodina</option>
                  <option>Jiná cílová skupina</option>
                </select>
              </label>
            </div>

            <div className="formRow">
              <label>
                Jazyková úroveň
                <select name="uroven" defaultValue="Nevím – poradíme se">
                  <option>A1 – začátečník</option>
                  <option>A2 – mírně pokročilý</option>
                  <option>B1 – středně pokročilý</option>
                  <option>B2 nebo vyšší</option>
                  <option>Nevím – poradíme se</option>
                </select>
              </label>

              <label>
                Preferovaný kontakt
                <input
                  type="text"
                  name="telefon_nebo_jiny_kontakt"
                  placeholder="Telefon nebo jiný kontakt (nepovinné)"
                />
              </label>
            </div>

            <input
              className="honeypot"
              type="text"
              name="_gotcha"
              tabIndex="-1"
              autoComplete="off"
            />

            <button
              className="submitButton"
              type="submit"
              disabled={formStatus === "sending"}
            >
              {formStatus === "sending"
                ? "Odesílám poptávku…"
                : "Odeslat nezávaznou poptávku"}
            </button>

            <p className="formNote">
              Odeslání je zdarma a nezavazuje vás k objednávce.
            </p>

            {formMessage && (
              <p
                className={`formMessage ${
                  formStatus === "success" ? "successMessage" : "errorMessage"
                }`}
                role="status"
                aria-live="polite"
              >
                {formMessage}
              </p>
            )}
          </form>
        </section>

        <footer>
          Ing. Karl Story Language Library • Učení jazyků prostřednictvím
          příběhů
        </footer>
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        .storiesPage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 8% 10%,
              rgba(34, 197, 94, 0.1),
              transparent 28%
            ),
            radial-gradient(
              circle at 92% 12%,
              rgba(37, 99, 235, 0.11),
              transparent 30%
            ),
            linear-gradient(135deg, #f5fbf7 0%, #f8fbff 48%, #fffaf2 100%);
          color: #172033;
          font-family: Arial, sans-serif;
        }

        .pageShell {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 34px 0 24px;
        }

        .backLink {
          display: inline-flex;
          align-items: center;
          color: #15803d;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
        }

        .backLink:hover {
          color: #166534;
          text-decoration: underline;
        }

        .hero {
          max-width: 850px;
          margin: 54px auto 62px;
          text-align: center;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #15803d;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .hero h1 {
          max-width: 820px;
          margin: 0 auto 18px;
          font-size: clamp(38px, 6vw, 66px);
          line-height: 1.04;
          letter-spacing: -0.045em;
        }

        .heroText {
          max-width: 700px;
          margin: 0 auto;
          color: #526074;
          font-size: clamp(17px, 2.2vw, 20px);
          line-height: 1.65;
        }

        .heroBadges {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .heroBadges span {
          padding: 9px 14px;
          border: 1px solid #d8e7dc;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          color: #31523b;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 7px 20px rgba(15, 23, 42, 0.05);
        }

        .sectionHeading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .sectionHeading h2,
        .centerHeading h2,
        .customStory h2,
        .orderIntro h2 {
          margin: 0;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          letter-spacing: -0.035em;
        }

        .sectionHeading > p {
          margin: 0 0 5px;
          color: #64748b;
          font-weight: 700;
        }

        .storyGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .storyCard {
          overflow: hidden;
          border: 1px solid rgba(218, 228, 222, 0.95);
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.09);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .storyCard:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 56px rgba(15, 23, 42, 0.13);
        }

        .storyImage {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: linear-gradient(135deg, #dcfce7, #dbeafe);
        }

        .storyImage img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 300ms ease;
        }

        .storyCard:hover .storyImage img {
          transform: scale(1.025);
        }

        .freeBadge {
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 7px 11px;
          border-radius: 999px;
          background: #16a34a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 6px 18px rgba(22, 163, 74, 0.25);
        }

        .storyEmoji {
          position: absolute;
          bottom: 12px;
          left: 14px;
          display: grid;
          width: 44px;
          height: 44px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 25px;
          backdrop-filter: blur(8px);
        }

        .storyContent {
          padding: 21px;
        }

        .storyMeta {
          margin: 0 0 8px;
          color: #15803d;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .storyMeta span {
          margin: 0 4px;
          color: #94a3b8;
        }

        .storyContent h3 {
          min-height: 56px;
          margin: 0 0 10px;
          font-size: 23px;
          line-height: 1.2;
          letter-spacing: -0.025em;
        }

        .storyDescription {
          min-height: 88px;
          margin: 0 0 18px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.58;
        }

        .chooseLanguage {
          margin: 0 0 9px;
          color: #334155;
          font-size: 13px;
          font-weight: 900;
        }

        .languageLinks {
          display: grid;
          gap: 8px;
        }

        .languageLinks a {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #bbf7d0;
          border-radius: 11px;
          background: #f0fdf4;
          color: #166534;
          font-size: 14px;
          font-weight: 850;
          text-decoration: none;
          transition:
            background 150ms ease,
            color 150ms ease,
            border-color 150ms ease;
        }

        .languageLinks a:hover {
          border-color: #16a34a;
          background: #16a34a;
          color: #ffffff;
        }

        .customStory {
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 48px;
          align-items: center;
          margin: 76px 0;
          padding: clamp(32px, 5vw, 58px);
          overflow: hidden;
          border-radius: 30px;
          background:
            radial-gradient(
              circle at 90% 10%,
              rgba(255, 255, 255, 0.16),
              transparent 24%
            ),
            linear-gradient(135deg, #14532d 0%, #15803d 54%, #16a34a 100%);
          color: #ffffff;
          box-shadow: 0 24px 60px rgba(20, 83, 45, 0.23);
        }

        .lightEyebrow {
          color: #bbf7d0;
        }

        .customStoryText > p:not(.eyebrow) {
          max-width: 670px;
          margin: 18px 0 22px;
          color: #dcfce7;
          font-size: 17px;
          line-height: 1.65;
        }

        .customStory ul {
          display: grid;
          gap: 11px;
          margin: 0 0 28px;
          padding: 0;
          list-style: none;
        }

        .customStory li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #f0fdf4;
          line-height: 1.45;
        }

        .customStory li span {
          display: grid;
          flex: 0 0 23px;
          width: 23px;
          height: 23px;
          place-items: center;
          border-radius: 999px;
          background: #dcfce7;
          color: #166534;
          font-size: 13px;
          font-weight: 900;
        }

        .primaryCta {
          display: inline-flex;
          justify-content: center;
          padding: 14px 20px;
          border-radius: 12px;
          background: #ffffff;
          color: #166534;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
        }

        .primaryCta:hover {
          background: #f0fdf4;
          transform: translateY(-1px);
        }

        .customStoryVisual {
          display: grid;
          grid-template-columns: 1fr;
          justify-items: center;
          gap: 5px;
          padding: 26px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.11);
          text-align: center;
          backdrop-filter: blur(8px);
        }

        .customStoryVisual span {
          font-size: 42px;
        }

        .customStoryVisual strong {
          font-size: 14px;
        }

        .customStoryVisual i {
          color: #bbf7d0;
          font-size: 22px;
          font-style: normal;
          font-weight: 900;
        }

        .ideasSection {
          margin-bottom: 76px;
        }

        .centerHeading {
          max-width: 720px;
          margin: 0 auto 28px;
          text-align: center;
        }

        .centerHeading > p:last-child {
          margin: 14px auto 0;
          color: #64748b;
          font-size: 16px;
          line-height: 1.6;
        }

        .ideasGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .ideaCard {
          display: grid;
          grid-template-columns: auto 1fr;
          column-gap: 13px;
          align-items: center;
          padding: 17px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.055);
        }

        .ideaEmoji {
          grid-row: 1 / span 2;
          font-size: 34px;
        }

        .ideaCard h3 {
          margin: 0 0 4px;
          font-size: 16px;
          line-height: 1.25;
        }

        .ideaCard p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.45;
        }

        .ideaCard button {
          grid-column: 1 / -1;
          margin-top: 13px;
          padding: 10px 12px;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          background: #f0fdf4;
          color: #166534;
          font-weight: 850;
          cursor: pointer;
        }

        .ideaCard button:hover {
          border-color: #16a34a;
          background: #dcfce7;
        }

        .orderSection {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: clamp(30px, 5vw, 64px);
          align-items: start;
          scroll-margin-top: 24px;
          padding: clamp(28px, 5vw, 54px);
          border: 1px solid #dce6df;
          border-radius: 30px;
          background: #ffffff;
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.1);
        }

        .orderIntro > p:not(.eyebrow) {
          margin: 18px 0 26px;
          color: #64748b;
          line-height: 1.65;
        }

        .orderSteps {
          display: grid;
          gap: 14px;
        }

        .orderSteps > div {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .orderSteps span {
          display: grid;
          flex: 0 0 32px;
          width: 32px;
          height: 32px;
          place-items: center;
          border-radius: 10px;
          background: #dcfce7;
          color: #166534;
          font-weight: 900;
        }

        .orderSteps p {
          display: grid;
          gap: 3px;
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.4;
        }

        .orderSteps strong {
          color: #253147;
        }

        .orderForm {
          display: grid;
          gap: 15px;
          padding: clamp(20px, 4vw, 30px);
          border: 1px solid #dce8e0;
          border-radius: 22px;
          background: #f8fcf9;
        }

        .formRow {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .orderForm label {
          display: grid;
          gap: 7px;
          color: #334155;
          font-size: 13px;
          font-weight: 850;
        }

        .orderForm input,
        .orderForm select,
        .orderForm textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
          background: #ffffff;
          color: #172033;
          font: inherit;
          font-size: 14px;
          font-weight: 400;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease;
        }

        .orderForm input,
        .orderForm select {
          height: 45px;
          padding: 0 12px;
        }

        .orderForm textarea {
          min-height: 125px;
          padding: 12px;
          resize: vertical;
          line-height: 1.5;
        }

        .orderForm input:focus,
        .orderForm select:focus,
        .orderForm textarea:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.13);
        }

        .honeypot {
          position: absolute !important;
          left: -9999px !important;
          width: 1px !important;
          height: 1px !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        .submitButton {
          width: 100%;
          padding: 14px 18px;
          border: none;
          border-radius: 11px;
          background: #16a34a;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.2);
        }

        .submitButton:hover:not(:disabled) {
          background: #15803d;
          transform: translateY(-1px);
        }

        .submitButton:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .formNote {
          margin: -3px 0 0;
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }

        .formMessage {
          margin: 0;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 750;
          line-height: 1.45;
          text-align: center;
        }

        .successMessage {
          border: 1px solid #86efac;
          background: #dcfce7;
          color: #166534;
        }

        .errorMessage {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        footer {
          margin-top: 46px;
          padding: 24px 0 4px;
          border-top: 1px solid rgba(148, 163, 184, 0.35);
          color: #64748b;
          font-size: 14px;
          text-align: center;
        }

        @media (max-width: 980px) {
          .storyGrid {
            grid-template-columns: 1fr;
          }

          .storyCard {
            display: grid;
            grid-template-columns: 0.8fr 1.2fr;
          }

          .storyImage {
            height: 100%;
            min-height: 330px;
          }

          .storyContent h3,
          .storyDescription {
            min-height: 0;
          }

          .customStory,
          .orderSection {
            grid-template-columns: 1fr;
          }

          .customStoryVisual {
            grid-template-columns: repeat(5, auto);
            justify-content: center;
          }

          .customStoryVisual strong {
            display: none;
          }

          .ideasGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 680px) {
          .pageShell {
            width: min(100% - 28px, 1180px);
            padding-top: 24px;
          }

          .hero {
            margin: 42px auto 48px;
          }

          .sectionHeading {
            display: block;
          }

          .sectionHeading > p {
            margin-top: 10px;
          }

          .storyCard {
            display: block;
          }

          .storyImage {
            height: 205px;
            min-height: 0;
          }

          .customStory {
            margin: 56px 0;
            border-radius: 23px;
          }

          .customStoryVisual {
            grid-template-columns: repeat(5, auto);
            padding: 18px;
          }

          .customStoryVisual span {
            font-size: 30px;
          }

          .ideasSection {
            margin-bottom: 56px;
          }

          .ideasGrid,
          .formRow {
            grid-template-columns: 1fr;
          }

          .orderSection {
            border-radius: 23px;
          }
        }
      `}</style>
    </main>
  );
}