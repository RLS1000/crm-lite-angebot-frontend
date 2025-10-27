// src/pages/KundePage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function KundePage() {
  const { token } = useParams();
  const [buchung, setBuchung] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`https://crm-lite-backend-production.up.railway.app/api/auftrag/${token}`)
      .then((res) => setBuchung(res.data))
      .catch((err) => {
        console.error("❌ Fehler beim Laden der Buchungsdaten:", err);
        setError("Buchung konnte nicht geladen werden.");
      });
  }, [token]);

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!buchung) return <div className="p-4">Lade deine Buchungsübersicht...</div>;

  const {
    name, event_datum, event_startzeit, event_endzeit,
    artikel, artikel_summe, location,
    fotolayout_url, qr_layout_url, online_galerie_url
  } = buchung;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-bold">📸 Deine Buchung bei Mr. Knips</h1>

      <div>
        <h2 className="font-semibold">📅 Event</h2>
        <p>{new Date(event_datum).toLocaleDateString("de-DE")} – {event_startzeit} bis {event_endzeit}</p>
        {location && (
          <p>
            {location.name}<br />
            {location.strasse}<br />
            {location.plz} {location.ort}
          </p>
        )}
      </div>

      <div>
        <h2 className="font-semibold">🧾 Gebuchte Leistungen</h2>
        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: artikel }} />
        <p className="font-bold mt-2">Gesamtsumme: {artikel_summe} €</p>
      </div>

      <div>
        <h2 className="font-semibold">🎨 Fotolayout</h2>
        {fotolayout_url ? (
          <img src={fotolayout_url} alt="Fotolayout" className="max-w-xs border rounded" />
        ) : (
          <p><a href="/anleitung/fotolayout.pdf" className="text-blue-600 underline" target="_blank">Noch kein Layout hochgeladen – zur Anleitung</a></p>
        )}
      </div>

      <div>
        <h2 className="font-semibold">🔲 QR-Code-Layout</h2>
        {qr_layout_url ? (
          <img src={qr_layout_url} alt="QR-Layout" className="max-w-xs border rounded" />
        ) : (
          <p><a href="/anleitung/qrlayout.pdf" className="text-blue-600 underline" target="_blank">Noch kein QR-Layout hinterlegt – zur Anleitung</a></p>
        )}
      </div>

      <div>
        <h2 className="font-semibold">🌐 Online-Galerie</h2>
        {online_galerie_url ? (
          <a href={online_galerie_url} target="_blank" className="text-blue-600 underline">Zur Galerie</a>
        ) : (
          <p>Noch keine Galerie verfügbar</p>
        )}
      </div>
    </div>
  );
}

export default KundePage;
