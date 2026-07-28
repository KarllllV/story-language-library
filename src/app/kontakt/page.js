import Link from "next/link";

export const metadata = {
  title: "Kontakt | Ing. Karl Story Language Library",
  description:
    "Kontaktujte Ing. Karl Story Language Library s dotazem, připomínkou nebo poptávkou vlastního jazykového příběhu.",
};

const fieldStyle = {
  width: "100%",
  padding: "12px 13px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  outline: "none",
  background: "#ffffff",
  color: "#172033",
  fontFamily: "Arial, sans-serif",
  fontSize: "15px",
};

const labelStyle = {
  display: "grid",
  gap: "7px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: "800",
};

export default function ContactPage() {
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
      <div style={{ width: "min(1040px, 100%)", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            marginBottom: "28px",
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <section style={{ padding: "18px 4px" }}>
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
              Napište mi
            </p>

            <h1
              style={{
                margin: "0 0 16px",
                color: "#172033",
                fontSize: "clamp(38px, 6vw, 56px)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              Kontakt
            </h1>

            <p
              style={{
                margin: "0 0 20px",
                color: "#475569",
                fontSize: "17px",
                lineHeight: 1.7,
              }}
            >
              Máte dotaz, nápad na vylepšení nebo zájem o vlastní interaktivní
              příběh? Napište mi a domluvíme se na možnostech.
            </p>

            <div
              style={{
                padding: "20px",
                border: "1px solid #dbe7df",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.86)",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#172033",
                  fontWeight: "900",
                }}
              >
                Kontaktní formulář
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  lineHeight: 1.6,
                }}
              >
                Vyplňte formulář a odpověď vám přijde na e-mail, který v něm
                uvedete.
              </p>
            </div>
          </section>

          <form
            action="https://formspree.io/f/xpqvddgk"
            method="POST"
            style={{
              display: "grid",
              gap: "16px",
              padding: "clamp(22px, 4vw, 32px)",
              border: "1px solid #dce8e0",
              borderRadius: "24px",
              background: "#ffffff",
              boxShadow: "0 18px 50px rgba(15, 23, 42, 0.1)",
            }}
          >
            <input
              type="hidden"
              name="_subject"
              value="Nová zpráva z kontaktní stránky"
            />

            <label style={labelStyle}>
              Jméno *
              <input
                type="text"
                name="jmeno"
                autoComplete="name"
                required
                placeholder="Vaše jméno"
                style={fieldStyle}
              />
            </label>

            <label style={labelStyle}>
              E-mail *
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="vas@email.cz"
                style={fieldStyle}
              />
            </label>

            <label style={labelStyle}>
              S čím vám mohu pomoci?
              <select
                name="typ_pozadavku"
                defaultValue="Obecný dotaz"
                style={fieldStyle}
              >
                <option>Obecný dotaz</option>
                <option>Příběh na přání</option>
                <option>Nová jazyková varianta</option>
                <option>Technický problém</option>
                <option>Spolupráce</option>
                <option>Jiný požadavek</option>
              </select>
            </label>

            <label style={labelStyle}>
              Zpráva *
              <textarea
                name="zprava"
                required
                rows="7"
                placeholder="Napište svůj dotaz nebo představu…"
                style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55 }}
              />
            </label>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "none",
                borderRadius: "11px",
                background: "#16a34a",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(22, 163, 74, 0.2)",
              }}
            >
              Odeslat zprávu
            </button>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "12px",
                lineHeight: 1.55,
                textAlign: "center",
              }}
            >
              Odesláním zprávy potvrzujete, že jste se seznámili se{" "}
              <Link
                href="/ochrana-soukromi"
                style={{ color: "#15803d", fontWeight: "700" }}
              >
                zásadami ochrany soukromí
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}