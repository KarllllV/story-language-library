export default function AboutSection() {
  return (
    <section className="aboutSection">
      <div className="aboutLeft">
        <h2>🎓 Jak vám aplikace pomůže?</h2>

        <p>
          Tato aplikace byla vytvořena pro všechny, kteří se chtějí učit cizí
          jazyky moderním a zábavným způsobem. Místo nudného memorování slovíček
          se budete učit pomocí interaktivních příběhů, hlasové konverzace,
          tréninku výslovnosti a jazykových her.
        </p>

        <p>
          Každé slovo můžete jedním kliknutím přeložit, uložit do svého
          slovníčku a kdykoliv se k němu vrátit. Novou slovní zásobu si potom
          upevníte v kvízu, pexesu nebo křížovce a svůj postup můžete průběžně
          sledovat.
        </p>

        <ul className="aboutList">
          <li>✅ Interaktivní čtení příběhů</li>

          <li>✅ AI hlasová konverzace</li>

          <li>✅ Procvičování správné výslovnosti</li>

          <li>✅ Jazykové kvízy z jednotlivých příběhů</li>

          <li>✅ Pexeso se slovíčky a jejich překlady</li>

          <li>✅ Křížovky pro upevnění slovní zásoby</li>

          <li>✅ Vlastní slovníček</li>

          <li>✅ Přehled vašeho pokroku</li>

          <li>✅ Přibývající příběhy a nové jazyky</li>
        </ul>
      </div>

      <div className="aboutRight">
        <div className="studyCircle">
          <div className="circle1"></div>
          <div className="circle2"></div>

          <div className="studyEmoji">📖</div>

          <div className="studyEmoji headphones">🎧</div>

          <div className="studyEmoji globe">🌍</div>
        </div>
      </div>
    </section>
  );
}