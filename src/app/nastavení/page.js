import Link from "next/link";

export default function NastaveniPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f8fafc",
        color: "#172033",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "32px",
          borderRadius: "24px",
          background: "white",
          boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1>⚙️ Nastavení</h1>

        <p>
          Zde později nastavíme hlas, rychlost předčítání a jazyk aplikace.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "12px 18px",
            borderRadius: "12px",
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            fontWeight: "700",
          }}
        >
          Zpět na hlavní stránku
        </Link>
      </div>
    </main>
  );
}