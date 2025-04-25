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
  });

  useEffect(() => {
    axios
      .get(`https://crm-lite-angebot-frontend-production.up.railway.app/angebot/${token}`)
      .then((res) => setAngebot(res.data))
      .catch((err) => setError("Angebot konnte nicht geladen werden."));
  }, [token]);

  const handleBuchen = async () => {
    if (
      !form.vorname || !form.nachname || !form.strasse ||
      !form.plz || !form.ort || !form.email
    ) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    // API-Aufruf folgt bald:
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
      <h1 className="text-2xl font-bold mb-4">
        Angebot für {angebot.lead.vorname} {angebot.lead.nachname}
      </h1>

      <p><strong>Event-Datum:</strong> {angebot.lead.event_datum}</p>
      <p><strong>Ort:</strong> {angebot.lead.event_ort}</p>

      <h2 className="text-xl mt-6 mb-2 font-semibold">Artikel</h2>
      <ul className="list-disc pl-6">
        {angebot.artikel.map((a) => (
          <li key={a.id}>
            {a.variante_name} – {a.einzelpreis} € x {a.anzahl}
          </li>
        ))}
      </ul>

      <div className="mt-6 text-lg font-bold">
        Gesamtsumme: {gesamt} €
      </div>

      {/* RECHNUNGSADRESSE */}
      <h2 className="text-xl mt-8 mb-2 font-semibold">Rechnungsadresse</h2>

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
      </div>

      <button
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={handleBuchen}
      >
        Verbindlich buchen
      </button>
    </div>
  );
}

export default AngebotPage;
