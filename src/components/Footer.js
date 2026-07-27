import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        display: "block",
        width: "100vw",
        marginTop: "100px",
        marginLeft: "calc(50% - 50vw)",
        boxSizing: "border-box",
        color: "#ffffff",
        background:
          "linear-gradient(135deg, #104c1f 0%, #14460b 50%, #0d4c21 100%)",
        boxShadow: "0 -12px 35px rgba(15, 23, 42, 0.18)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "55px 30px 45px",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "45px",
          textAlign: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 18px",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "800",
            }}
          >
            📚 Ing. Karl Story Language Library
          </h3>

          <p
            style={{
              maxWidth: "420px",
              margin: "0 auto",
              color: "#dbeafe",
              fontSize: "16px",
              lineHeight: "1.8",
            }}
          >
            Moderní aplikace pro výuku jazyků pomocí interaktivních příběhů,
            hlasové konverzace, výslovnosti a vlastního slovníčku.
          </p>
        </div>

        <div>
          <h3
            style={{
              margin: "0 0 18px",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "800",
            }}
          >
            Rychlá navigace
          </h3>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#dbeafe",
                fontSize: "16px",
                textDecoration: "none",
              }}
            >
              Hlavní stránka
            </Link>

            <Link
              href="/stories"
              style={{
                color: "#dbeafe",
                fontSize: "16px",
                textDecoration: "none",
              }}
            >
              Interaktivní příběhy
            </Link>

            <Link
              href="/konverzace"
              style={{
                color: "#dbeafe",
                fontSize: "16px",
                textDecoration: "none",
              }}
            >
              Hlasová konverzace
            </Link>

            <Link
              href="/vyslovnost"
              style={{
                color: "#dbeafe",
                fontSize: "16px",
                textDecoration: "none",
              }}
            >
              Výslovnost
            </Link>

            <Link
              href="/slovnik"
              style={{
                color: "#dbeafe",
                fontSize: "16px",
                textDecoration: "none",
              }}
            >
              Slovníček
            </Link>
          </nav>
        </div>

        <div>
          <h3
            style={{
              margin: "0 0 18px",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "800",
            }}
          >
            Výuka jazyků
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "13px",
              color: "#dbeafe",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            <span>🇬🇧 Angličtina</span>
            <span>🇩🇪 Němčina</span>
            <span>🇨🇿 Čeština</span>
          </div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          padding: "22px 20px",
          boxSizing: "border-box",
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          background: "rgba(15, 23, 42, 0.28)",
          color: "#bfdbfe",
          textAlign: "center",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        © {year} Ing. Karl ArtStudio • Všechna práva vyhrazena.
      </div>
    </footer>
  );
}