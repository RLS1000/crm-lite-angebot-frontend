// src/pages/KundePage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function KundePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`https://crm-lite-backend-production.up.railway.app/api/auftrag/${token}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Fehler beim Laden der Buchungsdaten:", err);
        setError("Buchung konnte nicht geladen werden.");
      });
  }, [token]);

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return <div className="p-4">Lade deine Buchungsübersicht...</div>;

  const { buchung, artikel } = data;

  const {
    event_datum,
    event_startzeit,
    event_endzeit,
    event_location,
    event_anschrift_strasse,
    event_anschrift_plz,
    event_anschrift_ort,
    layout_fertig,
    layout_qr_fertig,
    fotolayout_url,
    qr_layout_url,
    online_galerie_url,
    galerie_aktiv,
    galerie_passwort,
  } = buchung;

  // Artikel-IDs
  const printIDs = [1, 2, 3];
  const qrIDs = [28];
  const galerieIDs = [27];

  // Prüfungen ob relevante Artikel gebucht sind
  const artikelIDs = artikel.map((a) => a.artikel_id);
  const hatPrint = artikelIDs.some((id) => printIDs.includes(id));
  const hatQR = artikelIDs.some((id) => qrIDs.includes(id));
  const hatOnlineGalerie = artikelIDs.some((id) => galerieIDs.includes(id));

  return (
    <div className="p-8 max-w-3xl mx-auto text-gray-800 space-y-8">
      <header className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-semibold">Buchungsübersicht</h1>
        <p className="text-sm text-gray-500">Deine Buchung bei Mr. Knips</p>
      </header>

      {/* Eventdaten */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Event</h2>
        <p>{new Date(event_datum).toLocaleDateString("de-DE")}</p>
        <p>{event_startzeit} – {event_endzeit}</p>
        {event_location && (
          <div className="text-sm text-gray-700 mt-2">
            <p>{event_location}</p>
            {event_anschrift_strasse && <p>{event_anschrift_strasse}</p>}
            {(event_anschrift_plz || event_anschrift_ort) && (
              <p>{event_anschrift_plz} {event_anschrift_ort}</p>
            )}
          </div>
        )}
      </section>

      {/* Artikelübersicht */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Gebuchte Leistungen</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          {artikel.map((a) => (
            <li key={a.id}>
              {a.anzahl}x {a.variante_name} – {parseFloat(a.einzelpreis).toFixed(2)} €
              {a.bemerkung && <div className="text-xs text-gray-500">Hinweis: {a.bemerkung}</div>}
            </li>
          ))}
        </ul>
        <p className="mt-2 font-semibold">Gesamtsumme: {buchung.artikel_summe} €</p>
      </section>

             {/* Fotolayout */}
        {artikel.some((a) => [1, 2, 3].includes(a.artikel_id)) && (
          <section className="space-y-2">
            <h2 className="text-lg font-medium border-b pb-1">Fotolayout</h2>
        
            {fotolayout_url ? (
              <img src={fotolayout_url} alt="Fotolayout" className="max-w-xs border rounded" />
            ) : (
              <a
                href="/anleitung/fotolayout.pdf"
                className="text-sm text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Noch kein Layout hinterlegt – Anleitung ansehen
              </a>
            )}
        
            {layout_fertig && (
              <p className="text-sm text-green-700">✔️ Fotolayout ist freigegeben</p>
            )}
          </section>
        )}

      {/* QR-Layout */}
      {hatQR && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium border-b pb-1">QR-Code-Layout</h2>
          {qr_layout_url ? (
            <img src={qr_layout_url} alt="QR-Layout" className="max-w-xs border rounded" />
          ) : (
            <a
              href="/anleitung/qrlayout.pdf"
              className="text-sm text-blue-600 hover:underline"
              target="_blank"
            >
              Noch kein QR-Layout hinterlegt – Anleitung ansehen
            </a>
          )}
          {layout_qr_fertig && (
            <p className="text-sm text-green-700">✔️ QR-Layout ist freigegeben</p>
          )}
        </section>
      )}

      {/* Online-Galerie */}
      {hatOnlineGalerie && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium border-b pb-1">Online-Galerie</h2>

          {!galerie_aktiv ? (
            <p className="text-sm text-gray-500">Noch keine Galerie verfügbar</p>
          ) : (
            <>
              {online_galerie_url ? (
                <a
                  href={online_galerie_url}
                  target="_blank"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Galerie öffnen
                </a>
              ) : (
                <p className="text-sm text-gray-500">Link zur Galerie noch nicht hinterlegt</p>
              )}

              {galerie_passwort && (
                <p className="text-sm text-gray-700">
                  <strong>Passwort:</strong> {galerie_passwort}
                </p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default KundePage;
