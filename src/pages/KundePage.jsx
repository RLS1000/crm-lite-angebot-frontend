// src/pages/KundePage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function KundePage() {
  const { token } = useParams();
  const [daten, setDaten] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Buchungsübersicht – Mr. Knips";

    axios
      .get(`https://crm-lite-backend-production.up.railway.app/api/auftrag/${token}`)
      .then((res) => setDaten(res.data))
      .catch((err) => {
        console.error("❌ Fehler beim Laden der Buchungsdaten:", err);
        setError("Buchung konnte nicht geladen werden.");
      });
  }, [token]);

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!daten) return <div className="p-4">Lade deine Buchungsübersicht...</div>;

  const { buchung, artikel } = daten;

  const {
    event_datum,
    event_startzeit,
    event_endzeit,
    kunde_vorname,
    kunde_nachname,
    event_anschrift_ort,
    event_anschrift_strasse,
    event_anschrift_plz,
    event_location,
    fotolayout_url,
    qr_layout_url,
    online_galerie_url,
  } = buchung;

  const artikelSumme = artikel.reduce((sum, a) => {
    return sum + (parseFloat(a.einzelpreis) || 0) * (a.anzahl || 0);
  }, 0);

  // Helfer: hat der Kunde etwas bestimmtes gebucht?
  const hatFotolayout = artikel.some((a) =>
    a.variante_name.toLowerCase().includes("layout")
  );

  const hatQRLayout = artikel.some((a) =>
    a.variante_name.toLowerCase().includes("qr")
  );

  const hatGalerie = artikel.some((a) =>
    a.variante_name.toLowerCase().includes("galerie")
  );

  return (
    <div className="p-8 max-w-3xl mx-auto text-gray-800 space-y-8">
      {/* Header */}
      <header className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-semibold">Buchungsübersicht</h1>
        <p className="text-sm text-gray-500">
          Buchung für {kunde_vorname} {kunde_nachname}
        </p>
      </header>

      {/* Eventdaten */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Event</h2>
        <p>
          <strong>Datum:</strong> {new Date(event_datum).toLocaleDateString("de-DE")}
        </p>
        <p>
          <strong>Zeit:</strong> {event_startzeit} – {event_endzeit}
        </p>
        {event_location && (
          <>
            <p>
              <strong>Location:</strong> {event_location}
            </p>
          </>
        )}
        {(event_anschrift_strasse || event_anschrift_plz || event_anschrift_ort) && (
          <p>
            <strong>Anschrift:</strong><br />
            {event_anschrift_strasse && <>{event_anschrift_strasse}<br /></>}
            {(event_anschrift_plz || event_anschrift_ort) && (
              <>{event_anschrift_plz} {event_anschrift_ort}</>
            )}
          </p>
        )}
      </section>

      {/* Gebuchte Leistungen */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Gebuchte Leistungen</h2>
        {artikel && artikel.length > 0 ? (
          <>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 leading-relaxed">
              {artikel.map((a) => (
                <li key={a.id}>
                  {a.anzahl}× {a.variante_name} ({parseFloat(a.einzelpreis).toFixed(2)} €)
                  {a.bemerkung && (
                    <div className="text-gray-500 text-xs ml-4">
                      Hinweis: {a.bemerkung}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-2 text-right font-semibold">
              Gesamtsumme: {artikelSumme.toFixed(2)} €
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Keine Artikel hinterlegt.</p>
        )}
      </section>

      {/* Fotolayout */}
      {hatFotolayout && (
        <section className="space-y-1">
          <h2 className="text-lg font-medium border-b pb-1">Fotolayout</h2>
          {fotolayout_url ? (
            <img
              src={fotolayout_url}
              alt="Fotolayout"
              className="max-w-xs border rounded shadow-sm"
            />
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
      )}

      {/* QR-Code Layout */}
      {hatQRLayout && (
        <section className="space-y-1">
          <h2 className="text-lg font-medium border-b pb-1">QR-Code Layout</h2>
          {qr_layout_url ? (
            <img
              src={qr_layout_url}
              alt="QR-Layout"
              className="max-w-xs border rounded shadow-sm"
            />
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
      )}

      {/* Online-Galerie */}
      {hatGalerie && (
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
      )}
    </div>
  );
}

export default KundePage;
