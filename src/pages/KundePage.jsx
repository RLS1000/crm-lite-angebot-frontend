import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function KundePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Kundenportal – Mr. Knips";
  }, []);

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
  if (!data) return <div className="p-4">Lade dein Kundenportal...</div>;

  const { buchung, artikel } = data;

  const {
  kunde_vorname,
  kunde_nachname,
  kunde_email,
  kunde_telefon,
  kunde_firma,
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
  rechnungs_strasse,
  rechnungs_plz,
  rechnungs_ort
} = buchung;

  const artikelSumme = artikel.reduce((sum, a) => {
    const preis = parseFloat(a.einzelpreis) || 0;
    const anzahl = a.anzahl || 0;
    return sum + preis * anzahl;
  }, 0);

  // Artikel-IDs
  const printIDs = [1, 2, 3];
  const qrIDs = [28];
  const galerieIDs = [27];

  // Artikel-Prüfungen
  const artikelIDs = artikel.map((a) => a.artikel_id);
  const hatPrint = artikelIDs.some((id) => printIDs.includes(id));
  const hatQR = artikelIDs.some((id) => qrIDs.includes(id));
  const hatOnlineGalerie = artikelIDs.some((id) => galerieIDs.includes(id));

  return (
    <div className="p-8 max-w-3xl mx-auto text-gray-800 space-y-8">
      <header className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-semibold">Kundenportal</h1>
        <p className="text-sm text-gray-500">Deine Buchung bei Mr. Knips</p>
      </header>

{/* Auftraggeber + Rechnungsadresse */}
<section className="space-y-2">
  <h2 className="text-lg font-medium border-b pb-1">Auftraggeber</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
    
    {/* Auftraggeber */}
    <div>
      <h3 className="font-semibold mb-1">Kundendetails</h3>
      <p>{kunde_vorname} {kunde_nachname}</p>
      {kunde_firma && <p>{kunde_firma}</p>}
      <p>{kunde_email}</p>
      {kunde_telefon && <p>{kunde_telefon}</p>}
    </div>

    {/* Rechnungsadresse */}
    <div>
      <h3 className="font-semibold mb-1">Rechnungsadresse</h3>
      {rechnungs_strasse && <p>{rechnungs_strasse}</p>}
      {(rechnungs_plz || rechnungs_ort) && (
        <p>{rechnungs_plz} {rechnungs_ort}</p>
      )}
    </div>

  </div>
</section>

      
      {/* Eventdaten */}
<section className="space-y-2">
  <h2 className="font-semibold mb-1">Event</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
    
    {/* Linke Seite: Datum & Uhrzeit */}
    <div>
      <h3 className="font-semibold mb-1">Zeitraum</h3>
      <p>{new Date(event_datum).toLocaleDateString("de-DE", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric"
        })}
      </p>
      <p>
        von {event_startzeit?.slice(0, 5)} bis {event_endzeit?.slice(0, 5)} Uhr
      </p>
    </div>

    {/* Rechte Seite: Eventadresse */}
    {(event_location || event_anschrift_strasse || event_anschrift_plz || event_anschrift_ort) && (
      <div className="text-sm text-gray-700">
        <h3 className="font-semibold mb-1">Die Location</h3>
        {event_location && <p className="font-medium">{event_location}</p>}
        {event_anschrift_strasse && <p>{event_anschrift_strasse}</p>}
        {(event_anschrift_plz || event_anschrift_ort) && (
          <p>{event_anschrift_plz} {event_anschrift_ort}</p>
        )}
      </div>
    )}
  </div>
</section>

      {/* Artikelübersicht */}
      <section className="space-y-1">
        <h2 className="text-lg font-medium border-b pb-1">Buchungsdetails</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          {artikel.map((a) => (
            <li key={a.id} className="flex justify-between">
              <span>{a.anzahl}x {a.variante_name}</span>
              <span className="text-right min-w-[60px]">{parseFloat(a.einzelpreis).toFixed(2)} €</span>
            </li>
          ))}
        </ul>
       <p className="mt-4 pt-2 font-semibold text-right border-t border-gray-200">Gesamtsumme: {artikelSumme.toFixed(2)} €</p>
      </section>

      {/* Layoutauswahl */}
{hatPrint && (
  <section className="space-y-2">
    <h2 className="text-lg font-medium border-b pb-1">Layoutauswahl</h2>

    <p className="text-sm text-gray-700">
      Bitte wähle dein Wunschlayout aus und sende uns deine Angaben.
    </p>

    <a
      href="/anleitung/fotolayout.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-600 hover:underline"
    >
      Layout-Vorlage (PDF) ansehen
    </a>

    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: später API-Call oder Logging hier einbauen
        alert("Danke! Deine Layoutdaten wurden übermittelt.");
      }}
    >
      {/* Layout-Dropdown */}
      <div>
        <label className="block text-sm font-medium">Gewähltes Layout</label>
        <select
          name="layout_name"
          required
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="">Bitte wählen…</option>
          {[...Array(16)].map((_, i) => {
            const layoutCode = `Style ${String(i + 1).padStart(3, "0")}`;
            return (
              <option key={layoutCode} value={layoutCode}>
                {layoutCode}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Wunschtext</label>
        <input
          type="text"
          name="wunschtext"
          placeholder="z. B. Hochzeit Lisa & Tom"
          className="w-full border rounded px-2 py-1 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Datum im Layout</label>
        <input
          type="text"
          name="layout_datum"
          placeholder="z. B. 14.09.2025"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Farben / Farbwunsch</label>
        <input
          type="text"
          name="farbwunsch"
          placeholder="z. B. Gold, Weiß"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="col-span-full">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          Angaben absenden
        </button>
      </div>
    </form>
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
              rel="noopener noreferrer"
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
