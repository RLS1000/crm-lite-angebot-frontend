import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function AngebotPage() {
  const { token } = useParams();
  const [angebot, setAngebot] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    vorname: "",
    nachname: "",
    telefon: "",
    email: "",
    firmenname: "",
    anschrift_strasse: "",
    anschrift_plz: "",
    anschrift_ort: "",
    rechnungsanschrift_strasse: "",
    rechnungsanschrift_plz: "",
    rechnungsanschrift_ort: "",
    gleicheRechnungsadresse: true,
    agb: false,
    datenschutz: false,
  });

  useEffect(() => {
    axios
      .get(`https://crm-lite-backend-production.up.railway.app/api/angebot/${token}`)
      .then((res) => {
        setAngebot(res.data);
        const lead = res.data.lead;
        setForm((prev) => ({
          ...prev,
          vorname: lead.vorname || "",
          nachname: lead.nachname || "",
          email: lead.email || "",
          telefon: lead.telefon || "",
          firmenname: lead.firmenname || "",
        }));
      })
      .catch((err) => {
        console.error("Fehler beim Laden des Angebots:", err);
        setError("Angebot konnte nicht geladen werden.");
      });
  }, [token]);

  const istFirmenkunde = angebot?.lead?.kundentyp?.toLowerCase().includes("firma");

  const handleBuchen = async () => {
    if (
      !form.vorname ||
      !form.nachname ||
      !form.email ||
      !form.anschrift_strasse ||
      !form.anschrift_plz ||
      !form.anschrift_ort
    ) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    if (!form.agb || !form.datenschutz) {
      alert("Bitte akzeptiere die AGB und den Datenschutz.");
      return;
    }

    try {
      const response = await axios.post(
        `https://crm-lite-backend-production.up.railway.app/api/lead/${angebot.lead.id}/convert-to-booking`,
        {
          kontakt: {
            vorname: form.vorname,
            nachname: form.nachname,
            email: form.email,
            telefon: form.telefon,
            firmenname: form.firmenname,
          },
          rechnungsadresse: {
            anschrift_strasse: form.anschrift_strasse,
            anschrift_plz: form.anschrift_plz,
            anschrift_ort: form.anschrift_ort,
            rechnungsanschrift_strasse: form.gleicheRechnungsadresse
              ? form.anschrift_strasse
              : form.rechnungsanschrift_strasse,
            rechnungsanschrift_plz: form.gleicheRechnungsadresse
              ? form.anschrift_plz
              : form.rechnungsanschrift_plz,
            rechnungsanschrift_ort: form.gleicheRechnungsadresse
              ? form.anschrift_ort
              : form.rechnungsanschrift_ort,
            gleicheRechnungsadresse: form.gleicheRechnungsadresse,
          }
        }
      );

      if (response.data.success) {
        alert("✅ Dein Angebot wurde erfolgreich in eine Buchung umgewandelt!");
      } else {
        alert("❌ Fehler bei der Umwandlung. Bitte später erneut versuchen.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Netzwerkfehler. Bitte prüfe deine Internetverbindung oder kontaktiere den Support.");
    }
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!angebot) return <div className="p-4">Lade Angebot...</div>;

  const gesamt = angebot.artikel.reduce(
    (sum, a) => sum + parseFloat(a.einzelpreis) * a.anzahl,
    0
  ).toFixed(2);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-8">
      <h1 className="text-2xl font-bold">Angebot für deine Fotobox-Erinnerungen 📸</h1>

      {/* ... Event und Artikelanzeige bleibt gleich ... */}

      {/* KUNDENDATEN */}
      <h2 className="text-xl font-semibold">Deine Kontaktdaten</h2>
      <input placeholder="Vorname*" value={form.vorname} onChange={(e) => setForm({ ...form, vorname: e.target.value })} />
      <input placeholder="Nachname*" value={form.nachname} onChange={(e) => setForm({ ...form, nachname: e.target.value })} />
      <input placeholder="Telefon" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
      <input placeholder="E-Mail*" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

      {istFirmenkunde && (
        <>
          <h2 className="text-xl font-semibold">Firmendaten</h2>
          <input placeholder="Firmenname*" value={form.firmenname} onChange={(e) => setForm({ ...form, firmenname: e.target.value })} />
        </>
      )}

      <h2 className="text-xl font-semibold">Anschrift</h2>
      <input placeholder="Straße & Nr.*" value={form.anschrift_strasse} onChange={(e) => setForm({ ...form, anschrift_strasse: e.target.value })} />
      <input placeholder="PLZ*" value={form.anschrift_plz} onChange={(e) => setForm({ ...form, anschrift_plz: e.target.value })} />
      <input placeholder="Ort*" value={form.anschrift_ort} onChange={(e) => setForm({ ...form, anschrift_ort: e.target.value })} />

      <label>
        <input
          type="checkbox"
          checked={!form.gleicheRechnungsadresse}
          onChange={(e) => setForm({ ...form, gleicheRechnungsadresse: !e.target.checked })}
        />
        Abweichende Rechnungsadresse angeben
      </label>

      {!form.gleicheRechnungsadresse && (
        <>
          <input placeholder="Rechnungsstraße*" value={form.rechnungsanschrift_strasse} onChange={(e) => setForm({ ...form, rechnungsanschrift_strasse: e.target.value })} />
          <input placeholder="Rechnungs-PLZ*" value={form.rechnungsanschrift_plz} onChange={(e) => setForm({ ...form, rechnungsanschrift_plz: e.target.value })} />
          <input placeholder="Rechnungs-Ort*" value={form.rechnungsanschrift_ort} onChange={(e) => setForm({ ...form, rechnungsanschrift_ort: e.target.value })} />
        </>
      )}

      <label>
        <input
          type="checkbox"
          checked={form.agb}
          onChange={(e) => setForm({ ...form, agb: e.target.checked })}
        />
        Ich akzeptiere die AGB*
      </label>
      <label>
        <input
          type="checkbox"
          checked={form.datenschutz}
          onChange={(e) => setForm({ ...form, datenschutz: e.target.checked })}
        />
        Ich akzeptiere die Datenschutzbestimmungen*
      </label>

      <button onClick={handleBuchen}>
        Angebot verbindlich buchen
      </button>
    </div>
  );
}

export default AngebotPage;
