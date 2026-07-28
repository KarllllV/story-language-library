import Link from "next/link";

const menu = [
  {
    icon: "📚",
    title: "Interaktivní příběhy",
    text: "Čtěte a poslouchejte příběhy v různých jazycích. Kliknutím na slovo zobrazíte překlad.",
    link: "/stories",
    button: "Otevřít příběhy",
    color: "#2563eb",
  },
  {
    icon: "🎤",
    title: "Hlasová konverzace",
    text: "Mluvte s AI a procvičujte běžné situace z každodenního života.",
    link: "/konverzace",
    button: "Začít konverzaci",
    color: "#16a34a",
  },
  {
    icon: "🗣️",
    title: "Trénink výslovnosti",
    text: "Poslouchejte slova a věty a zlepšujte svou výslovnost.",
    link: "/vyslovnost",
    button: "Procvičit výslovnost",
    color: "#9333ea",
  },
  {
    icon: "📝",
    title: "Moje slovíčka",
    text: "Ukládejte si nová slovíčka z příběhů i konverzací a opakujte je.",
    link: "/slovnik",
    button: "Otevřít slovníček",
    color: "#ea580c",
  },
  {
    icon: "🏆",
    title: "Můj pokrok",
    text: "Sledujte počet naučených slov, dokončených příběhů a dalších aktivit.",
    link: "/pokrok",
    button: "Zobrazit pokrok",
    color: "#0891b2",
  },
  {
    icon: "⚙️",
    title: "Nastavení",
    text: "Nastavte jazyk aplikace, hlas, rychlost čtení a další možnosti.",
    link: "/nastaveni",
    button: "Otevřít nastavení",
    color: "#475569",
  },
];

export default function MainMenu() {
  return (
    <section className="menuSection">

      <h2>Co na stránce najdete</h2>

      <p className="menuText">
        Vyberte si oblast, kterou chcete právě studovat.
      </p>

      <div className="menuGrid">

        {menu.map((item) => (

          <div className="menuCard" key={item.title}>

            <div
              className="menuIcon"
              style={{ color: item.color }}
            >
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.text}</p>

            <Link
              href={item.link}
              className="menuButton"
              style={{ background: item.color }}
            >
              {item.button}
            </Link>

          </div>

        ))}

      </div>

    </section>
  );
}