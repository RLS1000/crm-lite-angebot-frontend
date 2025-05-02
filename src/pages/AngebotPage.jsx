// import & setup ...
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
      !form.vorname || !form.nachname || !form.email ||
      !form.anschrift_strasse || !form.anschrift_plz || !form.anschrift_ort
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
            rechnungsanschrift_strasse: form.gleicheRechnungsadresse ? null : form.rechnungsanschrift_strasse,
            rechnungsanschrift_plz: form.gleicheRechnungsadresse ? null : form.rechnungsanschrift_plz,
            rechnungsanschrift_ort: form.gleicheRechnungsadresse ? null : form.rechnungsanschrift_ort,
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

      {/* EVENTDETAILS */}
      <div>...</div>

      {/* ARTIKEL */}
      <div>...</div>

      {/* KUNDENDATEN */}
      <div>...</div>

      {/* FIRMENDATEN */}
      {istFirmenkunde && <div>...</div>}

      {/* ANSCHRIFT */}
      <h2 className="text-xl font-semibold mb-2">Anschrift</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          className="border p-2 rounded col-span-2"
          placeholder="Straße & Nr.*"
          value={form.anschrift_strasse}
          onChange={(e) => setForm({ ...form, anschrift_strasse: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="PLZ*"
          value={form.anschrift_plz}
          onChange={(e) => setForm({ ...form, anschrift_plz: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Ort*"
          value={form.anschrift_ort}
          onChange={(e) => setForm({ ...form, anschrift_ort: e.target.value })}
        />
      </div>

      <label className="flex items-center space-x-2 mb-2">
        <input
          type="checkbox"
          checked={!form.gleicheRechnungsadresse}
          onChange={(e) => setForm({ ...form, gleicheRechnungsadresse: !e.target.checked })}
        />
        <span>Abweichende Rechnungsadresse angeben</span>
      </label>

      {!form.gleicheRechnungsadresse && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded col-span-2"
            placeholder="Rechnungsstraße & Nr.*"
            value={form.rechnungsanschrift_strasse}
            onChange={(e) => setForm({ ...form, rechnungsanschrift_strasse: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Rechnungs-PLZ*"
            value={form.rechnungsanschrift_plz}
            onChange={(e) => setForm({ ...form, rechnungsanschrift_plz: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Rechnungs-Ort*"
            value={form.rechnungsanschrift_ort}
            onChange={(e) => setForm({ ...form, rechnungsanschrift_ort: e.target.value })}
          />
        </div>
      )}

      {/* AGB und Datenschutz */}
      <div>...</div>

      {/* BUCHEN */}
      <button className="...">Angebot verbindlich buchen</button>
    </div>
  );
}

export default AngebotPage;
