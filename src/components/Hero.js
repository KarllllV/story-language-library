import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero">
      <div className="heroLogoWrapper">
        <Image
          src="/images/newlogo.jpg"
          alt="Ing. Karl Story Language Library"
          width={640}
          height={640}
          className="heroLogo"
          priority
        />
      </div>

      <div className="heroContent">
        <p className="heroEyebrow">
          Příběhy • konverzace • výslovnost
        </p>

        <h1 className="heroTitle">
          Učte se cizí jazyky
          {" "}
          <span className="heroTitleHighlight">
            přirozeně a s radostí
          </span>
        </h1>

        <p className="heroText">
          Čtěte interaktivní příběhy, mluvte s AI a zlepšujte svou
          výslovnost. Nová slovíčka si jedním kliknutím přeložíte
          a uložíte do vlastního slovníčku.
        </p>
      </div>
    </section>
  );
}