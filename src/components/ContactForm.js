export default function ContactForm() {
  return (
    <section className="contactSection">

      <h2>📩 Kontaktujte mě</h2>

      <p className="contactDescription">
        Máte nápad na nový příběh, další jazyk nebo funkci?
        Nebo jste našli chybu?
        <br />
        Budu rád za každou zpětnou vazbu.
      </p>

      <form
        action="https://formspree.io/f/xpqvddgk"
        method="POST"
        className="contactForm"
      >

        <div className="row">

          <div className="inputGroup">
            <label>Jméno</label>

            <input
              type="text"
              name="name"
              placeholder="Vaše jméno"
              required
            />
          </div>

          <div className="inputGroup">
            <label>E-mail</label>

            <input
              type="email"
              name="email"
              placeholder="vas@email.cz"
              required
            />
          </div>

        </div>

        <div className="inputGroup">

          <label>Téma</label>

          <select name="subject">

            <option>Obecný dotaz</option>

            <option>Nový příběh</option>

            <option>Nový jazyk</option>

            <option>Hlasová konverzace</option>

            <option>Nahlášení chyby</option>

            <option>Spolupráce</option>

            <option>Jiné</option>

          </select>

        </div>

        <div className="inputGroup">

          <label>Zpráva</label>

          <textarea
            name="message"
            rows="7"
            placeholder="Sem napište svůj dotaz..."
            required
          />

        </div>

        <button
          type="submit"
          className="sendButton"
        >
          Odeslat zprávu
        </button>

      </form>

    </section>
  );
}