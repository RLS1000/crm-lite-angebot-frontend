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
        console.error("Fehler beim Laden der Buchungsdaten:", err);
        setError("Buchung konnte nicht geladen werden.");
      });
  }, [token]);

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!buchung) return <div className="p-4">Lade deine Buchungsübersicht...</div>;

  const {
    event_datum,
    event_startzeit,
    event_endzeit,
    buchung,
    artikel,
    fotolayout_url,
    qr_layout_url,
    online_galerie_url,
  } = buchung;

  return (
    <div className="p-8 max-w-3xl mx-auto text-gray-800 space-y-8">
      <header className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-semibold">Buchungsübersicht</h1>
        <p className="text-sm text-gray-500">
          Ihre Buchung bei Mr. Knips
        </p>
      </header>

      {/* Eventdaten */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Event</h2>
        <p>{new Date(event_datum).toLocaleDateString("de-DE")}</p>
        <p>{event_startzeit} – {event_endzeit}</p>
      </section>

      {/* Artikelübersicht */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Gebuchte Leistungen</h2>
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: artikel }} />
        {buchung?.artikel_summe && (
          <p className="mt-2 font-semibold">Gesamtsumme: {buchung.artikel_summe} €</p>
        )}
      </section>

      {/* Fotolayout */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Fotolayout</h2>
        {fotolayout_url ? (
          <img src={fotolayout_url} alt="Fotolayout" className="max-w-xs border rounded" />
        ) : (
          <a
            href="/anleitung/fotolayout.pdf"
            className="text-sm text-blue-600 hover:underline"
            target="_blank"
          >
            Noch kein Layout hinterlegt – Anleitung ansehen
          </a>
        )}
      </section>

      {/* QR Layout */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">QR-Code-Layout</h2>
        {qr_layout_url ? (
          <img src={qr_layout_url} alt="QR-Layout" className="max-w-xs border rounded" />
        ) : (
          <a
            href="/anleitung/qrlayout.pdf"
            className="text-sm text-blue-600 hover:underline"
            target="_blank"
          >
            Noch kein QR-Layout vorhanden – Anleitung ansehen
          </a>
        )}
      </section>

      {/* Galerie */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Online-Galerie</h2>
        {online_galerie_url ? (
          <a
            href={online_galerie_url}
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            Galerie öffnen
          </a>
        ) : (
          <p className="text-sm text-gray-500">Noch keine Galerie verfügbar</p>
        )}
      </section>
    </div>
  );
}

export default KundePage;
