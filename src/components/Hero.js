import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero">

      <div className="heroLogoWrapper">
        <Image
          src="/images/newlogo.jpg"
          alt="Ing. Karl Language Learning"
          width={640}
          height={640}
          className="heroLogo"
          priority
        />
      </div>

      <h1>
        Učte se jazyky
        <br />
        zábavně a efektivně
      </h1>

      <p className="heroText">
        Interaktivní příběhy, hlasová konverzace s AI,
        trénink výslovnosti a vlastní slovníček.
        <br />
        Vše na jednom místě pro moderní výuku jazyků.
      </p>

      {/* zbytek beze změny */}

    </section>
  );
}