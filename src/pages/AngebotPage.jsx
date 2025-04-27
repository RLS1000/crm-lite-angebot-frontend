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
    telefon: ""
  });

  useEffect(() => {
    console.log("TOKEN:", token);
    console.log("API URL:", `https://crm-lite-backend-production.up.railway.app/api/angebot/${token}`);

    axios
      .get(`https://crm-lite-backend-production.up.railway.app/api/angebot/${token}`)
      .then((res) => {
        console.log("Angebot geladen:", res.data);
        setAngebot(res.data);

        // 🧹 Formulardaten vorausfüllen
        const lead = res.data.lead;
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
      <h1 className="text-2xl font-bold mb-6">
        Angebot für {angebot.lead.vorname} {angebot.lead.nachname}
      </h1>

      {/* EVENTDATEN */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Event-Details</h2>
        <p><strong>Datum:</strong> {new Date(angebot.lead.event_datum).toLocaleDateString("de-DE")}</p>
        <p><strong>Beginn:</strong> {angebot.lead.event_startzeit}</p>
        <p><strong>Ende:</strong> {angebot.lead.event_endzeit || "Offen"}</p>
        <p><strong>Location:</strong> {angebot.lead.event_ort}</p>
      </div>

      {/* ARTIKEL */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Artikelübersicht</h2>
        <ul className="list-disc pl-6">
          {angebot.artikel.map((a) => (
            <li key={a.id}>
              {a.variante_name} – {a.einzelpreis} € × {a.anzahl}
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
              Wird nur für Rückfragen oder Notfälle genutzt.
            </span>
          </div>
        </div>
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
