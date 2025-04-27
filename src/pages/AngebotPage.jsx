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
    strasse: "",
    plz: "",
    ort: "",
    firmenname: "",
    firma_strasse: "",
    firma_plz: "",
    firma_ort: "",
    gleicheRechnungsadresse: false,
    agb: false,
    datenschutz: false,
  });

  const istFirmenkunde = angebot?.lead.kundentyp?.toLowerCase().includes("firma");

  useEffect(() => {
    axios
      .get(`https://crm-lite-backend-production.up.railway.app/api/angebot/${token}`)
      .then((res) => {
        setAngebot(res.data);

        // Felder vorausfüllen
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

  const handleBuchen = async () => {
    if (!form.vorname || !form.nachname || !form.email || !form.strasse || !form.plz || !form.ort) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }
    if (!form.agb || !form.datenschutz) {
      alert("Bitte akzeptiere die AGB und den Datenschutz.");
      return;
    }

    alert("🚀 Bestätigung wird bald an die API gesendet.");
    // API-Aufruf folgt!
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
      <div>
          <h2 className="text-xl font-semibold mb-2">Dein Event</h2>
          <p><strong>Datum:</strong> {new Date(angebot.lead.event_datum).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
          <p><strong>Location:</strong> {angebot.lead.event_ort}</p>
          <p><strong>Startzeit:</strong> {angebot.lead.event_startzeit?.slice(0,5)}</p>
          <p><strong>Endzeit:</strong> {angebot.lead.event_endzeit ? angebot.lead.event_endzeit.slice(0,5) : "spätestens am nächsten Vormittag"}</p>
      </div>


      {/* ARTIKEL */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Dein Angebot</h2>
        <ul className="list-disc pl-6 space-y-1">
          {angebot.artikel.map((a) => (
            <li key={a.id}>
              {a.anzahl}x {a.variante_name} – {parseFloat(a.einzelpreis).toFixed(2)} €
            </li>
          ))}
        </ul>
        <div className="mt-4 text-lg font-bold">Gesamtsumme: {gesamt} €</div>
      </div>

      {/* KUNDENDATEN */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Deine Kontaktdaten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Vorname*" value={form.vorname} onChange={(e) => setForm({...form, vorname: e.target.value})} />
          <input className="border p-2 rounded" placeholder="Nachname*" value={form.nachname} onChange={(e) => setForm({...form, nachname: e.target.value})} />
          <input className="border p-2 rounded col-span-2" placeholder="Telefon (optional)" value={form.telefon} onChange={(e) => setForm({...form, telefon: e.target.value})} />
          <input className="border p-2 rounded col-span-2" placeholder="E-Mail*" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
        </div>
      </div>

      {/* FIRMENDATEN */}
      {istFirmenkunde && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Firmendaten</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded col-span-2" placeholder="Firmenname*" value={form.firmenname} onChange={(e) => setForm({...form, firmenname: e.target.value})} />
            <input className="border p-2 rounded col-span-2" placeholder="Straße & Nr." value={form.firma_strasse} onChange={(e) => setForm({...form, firma_strasse: e.target.value})} />
            <input className="border p-2 rounded" placeholder="PLZ" value={form.firma_plz} onChange={(e) => setForm({...form, firma_plz: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Ort" value={form.firma_ort} onChange={(e) => setForm({...form, firma_ort: e.target.value})} />
          </div>

          <div className="mt-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={form.gleicheRechnungsadresse} onChange={(e) => setForm({...form, gleicheRechnungsadresse: e.target.checked})} />
              <span>Rechnungsadresse entspricht der Firmenadresse</span>
            </label>
          </div>
        </div>
      )}

      {/* RECHNUNGSADRESSE */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Rechnungsadresse</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded col-span-2" placeholder="Straße & Nr.*" value={form.strasse} onChange={(e) => setForm({...form, strasse: e.target.value})} />
          <input className="border p-2 rounded" placeholder="PLZ*" value={form.plz} onChange={(e) => setForm({...form, plz: e.target.value})} />
          <input className="border p-2 rounded" placeholder="Ort*" value={form.ort} onChange={(e) => setForm({...form, ort: e.target.value})} />
        </div>
      </div>

      {/* AGB und Datenschutz */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.agb} onChange={(e) => setForm({...form, agb: e.target.checked})} />
          <span>Ich akzeptiere die AGB*</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.datenschutz} onChange={(e) => setForm({...form, datenschutz: e.target.checked})} />
          <span>Ich akzeptiere die Datenschutzbestimmungen*</span>
        </label>
      </div>

      {/* BUCHEN */}
      <button
        className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded w-full text-lg"
        onClick={handleBuchen}
      >
        Angebot verbindlich buchen
      </button>
    </div>
  );
}

export default AngebotPage;
