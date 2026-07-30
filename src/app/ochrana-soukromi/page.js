import Link from "next/link";

export const metadata = {
  title: "Cookies | Ing. Karl Story Language Library",
  description:
    "Informace o cookies a místním úložišti v aplikaci Ing. Karl Story Language Library.",
};

const cardStyle = {
  padding: "24px",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  background: "#ffffff",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
};

const textStyle = {
  margin: "0 0 12px",
  color: "#475569",
  fontSize: "15px",
  lineHeight: 1.7,
};

export default function CookiesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "38px 18px",
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 48%, #eff6ff 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ width: "min(880px, 100%)", margin: "0 auto" }}>
        <nav
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <Link
            href="/"
            style={{
              padding: "10px 15px",
              borderRadius: "10px",
              background: "#16a34a",
              color: "white",
              fontSize: "14px",
              fontWeight: "800",
              textDecoration: "none",
            }}
          >
            ← Zpět na hlavní stránku
          </Link>

          <Link
            href="/ochrana-soukromi"
            style={{
              padding: "10px 15px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "white",
              color: "#334155",
              fontSize: "14px",
              fontWeight: "800",
              textDecoration: "none",
            }}
          >
            Ochrana soukromí
          </Link>
        </nav>

        <header style={{ marginBottom: "30px" }}>
          <p
            style={{
              margin: "0 0 9px",
              color: "#15803d",
              fontSize: "14px",
              fontWeight: "900",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Ing. Karl Story Language Library
          </p>

          <h1
            style={{
              margin: "0 0 14px",
              color: "#172033",
              fontSize: "clamp(36px, 6vw, 54px)",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
            }}
          >
            Informace o cookies
          </h1>

          <p style={{ ...textStyle, margin: 0, fontSize: "17px" }}>
            Na této stránce najdete přehled toho, jak aplikace používá cookies,
            místní úložiště a podobné technologie.
          </p>
        </header>

        <div style={{ display: "grid", gap: "16px" }}>
          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", color: "#172033" }}>
              Co jsou cookies
            </h2>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              Cookies jsou malé soubory, které může web uložit do vašeho
              prohlížeče. Podobným způsobem funguje místní úložiště prohlížeče,
              označované jako localStorage.
            </p>
          </section>

          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", color: "#172033" }}>
              Co aplikace ukládá
            </h2>
            <p style={textStyle}>
              Ing. Karl Story Language Library používá místní úložiště
              prohlížeče pro funkce, které si uživatel sám vyžádá:
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: "22px",
                color: "#475569",
                fontSize: "15px",
                lineHeight: 1.75,
              }}
            >
              <li>uložená slovíčka a vlastní slovník;</li>
              <li>pokrok a uloženou pozici ve čtení;</li>
              <li>nastavení hlasu, rychlosti a velikosti textu;</li>
              <li>další volby potřebné pro správné fungování aplikace.</li>
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", color: "#172033" }}>
              Nezbytné technologie
            </h2>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              Tyto údaje jsou používány k zajištění funkcí, které si v aplikaci
              zvolíte. Bez nich by například nebylo možné zachovat slovíčka,
              pokrok nebo nastavení mezi jednotlivými návštěvami. Nejsou
              používány k vytváření reklamního profilu.
            </p>
          </section>

          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", color: "#172033" }}>
              Analytické a reklamní cookies
            </h2>
            <p style={textStyle}>
              Aplikace používá Vercel Web Analytics pro anonymizované souhrnné
              statistiky návštěvnosti. Podle informací poskytovatele tato služba
              nepoužívá cookies a nevytváří reklamní profily jednotlivých
              návštěvníků.
            </p>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              Aplikace v současné podobě nepoužívá marketingové cookies ani
              reklamní profilování. Pokud budou později přidány analytické nebo
              reklamní technologie vyžadující souhlas, nebudou spuštěny před
              vaším rozhodnutím a tato stránka bude odpovídajícím způsobem
              aktualizována.
            </p>
          </section>

          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", color: "#172033" }}>
              Služby třetích stran
            </h2>
            <p style={textStyle}>
              Web je provozován prostřednictvím služby Vercel. Kontaktní
              formulář využívá Formspree a konverzace s AI může využívat Google
              Gemini. Tito poskytovatelé mohou při poskytování a zabezpečení
              svých služeb zpracovávat technické údaje podle vlastních pravidel.
            </p>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              Více informací najdete v našich{" "}
              <Link
                href="/ochrana-soukromi"
                style={{ color: "#15803d", fontWeight: "700" }}
              >
                zásadách ochrany soukromí
              </Link>
              .
            </p>
          </section>

          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", color: "#172033" }}>
              Jak uložené údaje odstranit
            </h2>
            <p style={textStyle}>
              Místní údaje můžete odstranit vymazáním dat webu v nastavení svého
              prohlížeče. Po vymazání mohou být odstraněna také uložená
              slovíčka, pokrok a vlastní nastavení aplikace.
            </p>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              Pokud potřebujete pomoc, napište do{" "}
              <a
                href="mailto:horinek.karel@gmail.com"
                style={{ color: "#15803d", fontWeight: "700" }}
              >
                přiloženého formuláře na hlavní stránce
              </a>
              .
            </p>
          </section>

          <p
            style={{
              margin: "2px 0 0",
              color: "#64748b",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            Poslední aktualizace: 28. července 2026
          </p>
        </div>
      </div>
    </main>
  );
}