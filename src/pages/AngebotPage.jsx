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
    strasse: "",
    plz: "",
    ort: "",
    email: "",
    telefon: "",
  });
  const [agbChecked, setAgbChecked] = useState(false);
  const [datenschutzChecked, setDatenschutzChecked] = useState(false);

  useEffect(() => {
    console.log("TOKEN:", token);
    axios
      .get(`https://crm-lite-backend-production.up.railway.app/api/angebot/${token}`)
      .then((res) => {
        console.log("Angebot geladen:", res.data);
        const lead = res.data.lead;
        setAngebot(res.data);

        setForm((prev) => ({
          ...prev,
          vorname: lead.vorname || "",
          nachname: lead.nachname || "",
          email: lead.email || "",
          telefon: lead.telefon || "",
          strasse: lead.strasse || "",
          plz: lead.plz || "",
          ort: lead.ort || "",
        }));
      })
      .catch((err) => {
        console.error("Fehler beim Laden des Angebots:", err);
        setError("Angebot konnte nicht geladen werden.");
      });
  }, [token]);

  const handleBuchen = async () => {
    if (
      !form.vorname || !form.nachname || !form.strasse ||
      !form.plz || !form.ort || !form.email || !form.telefon
    ) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    if (!agbChecked || !datenschutzChecked) {
      alert("Bitte bestätige die AGB und den Datenschutz.");
      return;
    }

    alert("🚀 Bestätigung wird bald an die API gesendet.");
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!angebot) return <div className="p-4">Lade Angebot...</div>;

  const gesamt = angebot.artikel.reduce(
    (sum, a) => sum + parseFloat(a.einzelpreis) * a.anzahl,
    0
  ).toFixed(2);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      {/* Titel */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        Dein persönliches Angebot für eine Fotobox 📸
      </h1>

      {/* EVENTDATEN */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Veranstaltungsort</h2>
        <p><strong>Location:</strong> {angebot.lead.event_ort}</p>
        {/* Falls wir später Name, Straße, PLZ, Ort separat speichern, können wir sie aufsplitten */}
        
        <h2 className="text-xl font-semibold mt-6 mb-2">Event-Zeiten</h2>
        <p><strong>Datum:</strong> {new Date(angebot.lead.event_datum).toLocaleDateString("de-DE")}</p>
        <p><strong>Beginn:</strong> {angebot.lead.event_startzeit?.substring(0,5) || "-"}</p>
        <p><strong>Ende:</strong> {angebot.lead.event_endzeit?.substring(0,5) || "Offen"}</p>
      </div>

      {/* ARTIKEL */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Deine Auswahl</h2>
        <ul className="list-disc pl-6">
          {angebot.artikel.map((a) => (
            <li key={a.id}>
              {a.anzahl}× {a.variante_name} – {a.einzelpreis} €
            </li>
          ))}
        </ul>

        <div className="mt-4 text-lg font-bold">
          Gesamtsumme: {gesamt} €
        </div>
      </div>

      {/* RECHNUNGSADRESSE */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Rechnungsadresse</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Vorname"
            value={form.vorname}
            onChange={(e) => setForm({ ...form, vorname: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Nachname"
            value={form.nachname}
            onChange={(e) => setForm({ ...form, nachname: e.target.value })}
          />
          <input
            className="border p-2 rounded col-span-2"
            placeholder="Straße & Hausnummer"
            value={form.strasse}
            onChange={(e) => setForm({ ...form, strasse: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="PLZ"
            value={form.plz}
            onChange={(e) => setForm({ ...form, plz: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Ort"
            value={form.ort}
            onChange={(e) => setForm({ ...form, ort: e.target.value })}
          />
          <input
            className="border p-2 rounded col-span-2"
            placeholder="E-Mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="col-span-2 relative">
            <input
              className="border p-2 rounded w-full"
              placeholder="Telefonnummer (Pflicht für Rückfragen)"
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })}
            />
            <span className="text-xs text-gray-500 absolute top-full left-0 mt-1">
              Nur für wichtige Rückfragen oder Absprache verwendet.
            </span>
          </div>
        </div>
      </div>

      {/* CHECKBOXEN */}
      <div className="mb-6 space-y-4 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={agbChecked}
            onChange={(e) => setAgbChecked(e.target.checked)}
          />
          Ich akzeptiere die AGB.
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={datenschutzChecked}
            onChange={(e) => setDatenschutzChecked(e.target.checked)}
          />
          Ich akzeptiere die Datenschutzbestimmungen.
        </label>
      </div>

      {/* BESTÄTIGUNG */}
      <button
        className="mt-6 w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-lg font-bold"
        onClick={handleBuchen}
      >
        Verbindlich buchen
      </button>
    </div>
  );
}

export default AngebotPage;
