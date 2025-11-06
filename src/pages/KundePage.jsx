// Start für das neue Layout – Struktur mit 2-Spalten-System
// Linke Spalte: Stammdaten (1/3)
// Rechte Spalte: Prozess / ToDos (2/3)

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function KundePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [layoutData, setLayoutData] = useState({
  style: "",
  text: "",
  datum: "",
  farbe: "#000000",
  });

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
    kundentyp,
    online_galerie_url,
    galerie_aktiv,
    galerie_passwort,
    rechnungs_name,
    rechnungs_strasse,
    rechnungs_plz,
    rechnungs_ort,
    fotos_bereit,
    fotodownload_link,
    fotolayout_style,
    fotolayout_text,
    fotolayout_datum,
    fotolayout_farbe,
    fotolayout_link,
    fotolayout_kundenfreigabe,
    fotolayout_freigabe_am
  } = buchung;

  const artikelSumme = artikel.reduce((sum, a) => {
    const preis = parseFloat(a.einzelpreis) || 0;
    const anzahl = a.anzahl || 0;
    return sum + preis * anzahl;
  }, 0);
 
// IDs für Varianten
const printIDs = [2, 4, 6];   // Fotobox MIT Druck
const qrIDs = [23];           // QR-Galerie Variante
const galerieIDs = [22];      // Online-Galerie Variante

// prüfe auf Basis der artikel_variante_id
const artikelVarianteIDs = artikel.map((a) => a.artikel_variante_id);

const hatPrint = artikelVarianteIDs.some((id) => printIDs.includes(id));
const hatQR = artikelVarianteIDs.some((id) => qrIDs.includes(id));
const hatOnlineGalerie = artikelVarianteIDs.some((id) => galerieIDs.includes(id));

  return (
    <div className="p-8 max-w-6xl mx-auto text-gray-800">
      <header className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-semibold">Kundenportal</h1>
        <p className="text-sm text-gray-500">Deine Buchung bei Mr. Knips</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Linke Spalte */}
        <div className="space-y-4 col-span-1 bg-gray-50 border border-gray-200 rounded-md p-4">
<section>
  <h2 className="font-semibold text-sm text-gray-500 mb-1">Kundendetails</h2>

  {/* Falls Firma vorhanden und sinnvoll */}
  {kunde_firma && !["-", "–", "--", ""].includes(kunde_firma.trim()) ? (
    <>
      <p className="font-medium">{kunde_firma}</p>
      <p>{kunde_vorname} {kunde_nachname}</p>
    </>
  ) : (
    <p className="font-medium">{kunde_vorname} {kunde_nachname}</p>
  )}

  <p>{kunde_email}</p>
  {kunde_telefon && <p>{kunde_telefon}</p>}
</section>

          <section>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-sm text-gray-500">Rechnungsadresse</h2>
              <a
                href="#"
                className="text-xs text-blue-600 hover:underline"
                title="Adresse bearbeiten"
              >
                Bearbeiten
              </a>
            </div>

            <p className="font-medium">
              {
                rechnungs_name?.trim()
                || (kunde_firma && kunde_firma !== '-' ? kunde_firma : `${kunde_vorname} ${kunde_nachname}`)
              }
            </p>

            <p>{rechnungs_strasse}</p>
            <p>{rechnungs_plz} {rechnungs_ort}</p>
          </section>

          <section>
            <h2 className="font-semibold text-sm text-gray-500 mb-1">Zeitraum</h2>
            <p>{new Date(event_datum).toLocaleDateString("de-DE", {
              weekday: "long", day: "2-digit", month: "long", year: "numeric"
            })}</p>
            <p>{event_startzeit?.slice(0,5)} bis {event_endzeit?.slice(0,5)} Uhr</p>
          </section>

          <section>
            <h2 className="font-semibold text-sm text-gray-500 mb-1">Location</h2>
            {event_location && <p className="font-medium">{event_location}</p>}
            <p>{event_anschrift_strasse}</p>
            <p>{event_anschrift_plz} {event_anschrift_ort}</p>
          </section>
        </div>

        {/* Rechte Spalte */}
        <div className="col-span-2 space-y-6">
          {/* Buchungsdetails */}
          <section>
            <details open className="bg-gray-50 rounded p-4">
              <summary className="font-medium cursor-pointer">Buchungsdetails</summary>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                {artikel.map((a) => (
                  <li key={a.id} className="flex justify-between">
                    <span>{a.anzahl}x {a.variante_name}</span>
                    <span>{parseFloat(a.einzelpreis).toFixed(2)} €</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-2 text-right border-t text-sm space-y-1">
  {kundentyp === "Privat" ? (
    <>
      <p>Gesamtsumme (inkl. USt.): <strong>{artikelSumme.toFixed(2)} €</strong></p>
      <p className="text-gray-500">inkl. 19 % USt.: {(artikelSumme / 1.19 * 0.19).toFixed(2)} €</p>
    </>
  ) : (
    <>
      <p>Gesamtsumme (netto): <strong>{artikelSumme.toFixed(2)} €</strong></p>
      <p className="text-gray-500">zzgl. 19 % USt.: {(artikelSumme * 0.19).toFixed(2)} €</p>
      <p className="font-semibold">Gesamtbetrag (brutto): {(artikelSumme * 1.19).toFixed(2)} €</p>
    </>
  )}
</div>
            </details>
          </section>

       {/* 2. Layoutauswahl */}
{hatPrint && (
  <div className={`${layout_fertig ? "w-[85%] mx-auto" : "w-full"} space-y-2`}>
    <div className="space-y-2 text-left">
      <h3 className="font-medium text-base">Fotodruck Layout</h3>

      <section
        className={`rounded p-4 ${
          layout_fertig ? "bg-gray-100 opacity-60" : "bg-white"
        }`}
      >
        {/* 💡 LOGIK-BLOCK START */}
        {(!fotolayout_style) ? (
          // 🟢 1. Formular anzeigen, wenn noch kein Layout übermittelt wurde
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Wähle dein Wunschlayout aus unserer PDF-Vorlage:
              </p>
              <a
                href="https://mrknips.de/download/fotolayout.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Layout-Anleitung öffnen (PDF)
              </a>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.patch(
                    `https://crm-lite-backend-production.up.railway.app/api/auftrag/${token}/layout`,
                    {
                      style: layoutData.style,
                      text: layoutData.text,
                      datum: layoutData.datum,
                      farbe: layoutData.farbe,
                      kundenfreigabe: false, // Wichtig: KEINE automatische Freigabe
                    }
                  );
                  alert("Danke! Deine Layoutdaten wurden gespeichert.");
                  window.location.reload();
                } catch (err) {
                  console.error("Fehler beim Speichern:", err);
                  alert("❌ Leider konnte das Layout nicht gespeichert werden.");
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Layout Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Gewähltes Layout</label>
                <select
                  required
                  value={layoutData.style}
                  onChange={(e) =>
                    setLayoutData((prev) => ({ ...prev, style: e.target.value }))
                  }
                  className="w-full h-10 border px-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Bitte wählen…</option>
                  {[...Array(16)].map((_, i) => (
                    <option key={i} value={`Style ${String(i + 1).padStart(3, "0")}`}>
                      Style {String(i + 1).padStart(3, "0")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wunschtext */}
              <div>
                <label className="block text-sm font-medium mb-1">Wunschtext</label>
                <input
                  type="text"
                  value={layoutData.text}
                  onChange={(e) =>
                    setLayoutData((prev) => ({ ...prev, text: e.target.value }))
                  }
                  className="w-full h-10 border px-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="z. B. Sonja & Ryan"
                />
              </div>

              {/* Datum */}
              <div>
                <label className="block text-sm font-medium mb-1">Datum im Layout</label>
                <input
                  type="text"
                  value={layoutData.datum}
                  onChange={(e) =>
                    setLayoutData((prev) => ({ ...prev, datum: e.target.value }))
                  }
                  className="w-full h-10 border px-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={new Date(event_datum).toLocaleDateString("de-DE")}
                />
              </div>
{/* Farbe */}
<div>
  <label className="block text-sm font-medium mb-1">Farbe (Hex)</label>
  <div className="flex gap-2 items-center">
    {/* Color Picker */}
    <input
      type="color"
      value={layoutData.farbe}
      onChange={(e) =>
        setLayoutData((prev) => ({ ...prev, farbe: e.target.value }))
      }
      className="h-10 w-12 p-0 border rounded"
    />

    {/* Textfeld für Hex-Wert */}
    <input
      type="text"
      value={layoutData.farbe}
      onChange={(e) =>
        setLayoutData((prev) => ({ ...prev, farbe: e.target.value }))
      }
      className="flex-1 h-10 border px-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      placeholder="#000000"
    />
  </div>
</div>

              {/* Submit */}
              <div className="col-span-full text-right">
                <button
                  type="submit"
                  className="h-10 bg-blue-600 text-white px-6 rounded text-sm hover:bg-blue-700"
                >
                  Angaben speichern
                </button>
              </div>
            </form>
          </>
        ) : fotolayout_style && !fotolayout_link ? (
          // 🟡 2. Layoutdaten wurden übermittelt, aber noch kein Bild
          <p className="text-sm text-gray-700">
            Danke! Wir gestalten dein persönliches Fotolayout auf Basis deiner Angaben.
          </p>
        ) : fotolayout_link && !fotolayout_kundenfreigabe ? (
          // 🟠 3. Bild ist da, aber noch nicht freigegeben
          <>
           <div className="mb-4">
              <img
                src={`${fotolayout_link}/download`}
                alt="Layout-Vorschau"
                className="rounded border max-w-full max-h-[400px] object-contain mx-auto block"
              />
            </div>

            <div className="text-right">
              <button
                className="h-10 bg-blue-600 text-white px-6 rounded text-sm hover:bg-blue-700"
                onClick={async () => {
                  try {
                    await axios.patch(
                      `https://crm-lite-backend-production.up.railway.app/api/auftrag/${token}/layout`,
                      { kundenfreigabe: true }
                    );
                    alert("Vielen Dank für deine Freigabe!");
                    window.location.reload();
                  } catch (err) {
                    console.error("Fehler bei Freigabe:", err);
                    alert("❌ Freigabe konnte nicht gespeichert werden.");
                  }
                }}
              >
                Layout freigeben
              </button>
            </div>
          </>
        ) : fotolayout_link && fotolayout_kundenfreigabe ? (
          // 🟢 4. Bild vorhanden & freigegeben
          <>
            <div className="mb-4">
              <img
                src={fotolayout_link}
                alt="Freigegebenes Layout"
                className="rounded border max-w-full"
              />
            </div>
            <p className="text-sm text-green-700">
              Freigegeben am {new Date(fotolayout_freigabe_am).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </>
        ) : layout_fertig && fotolayout_link ? (
          // 🟣 5. Admin hat fertig markiert (z. B. durch Appsmith)
          <>
            <div className="mb-4">
              <img
                src={fotolayout_link}
                alt="Finales Layout"
                className="rounded border max-w-full"
              />
            </div>
            <p className="text-sm text-gray-700">
              Layout wurde bereits erstellt.
            </p>
            {fotolayout_kundenfreigabe && fotolayout_freigabe_am && (
              <p className="text-sm text-green-700 mt-1">
                Freigegeben am {new Date(fotolayout_freigabe_am).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </>
        ) : (
          // 🧯 Fallback
          <p className="text-sm text-gray-500">Status konnte nicht ermittelt werden.</p>
        )}
        {/* 💡 LOGIK-BLOCK ENDE */}
      </section>
    </div>
  </div>
)}

{/* 3. QR-Code Layout */}
{hatQR && (
  <div className={`${layout_qr_fertig ? "w-[85%] mx-auto" : "w-full"} space-y-2`}>
    <div className="space-y-2 text-left">
      <h3 className="font-medium text-base">QR-Sofortbild Layout</h3>

      <section
        className={`rounded p-4 ${
          layout_qr_fertig ? "bg-gray-100 opacity-60" : "bg-white"
        }`}
      >
        {!layout_qr_fertig ? (
          <>
            {/* Anleitung */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Lade dein QR-Layout oder hinterlasse einen Wunsch:
              </p>
              <a
                href="/anleitung/qr-layout.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                QR-Layout-Anleitung öffnen (PDF)
              </a>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Danke! Deine QR-Layoutdaten wurden übermittelt.");
              }}
              className="grid grid-cols-1 gap-4"
            >
              {/* Upload-Feld */}
              <div>
                <label className="block text-sm font-medium mb-1">QR-Layout hochladen</label>
                <input
                  type="file"
                  name="qr_layout_upload"
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0 file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept="image/*,.pdf"
                />
              </div>

              {/* Kommentar-Feld */}
              <div>
                <label className="block text-sm font-medium mb-1">Anmerkung / Wunsch</label>
                <textarea
                  name="qr_wunsch"
                  rows={3}
                  className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="z. B. Bitte wie das letzte Layout gestalten, mit Datum unten rechts."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
              </div>

              {/* Submit */}
              <div className="text-right">
                <button
                  className="h-10 bg-blue-600 text-white px-6 rounded text-sm hover:bg-blue-700"
                >
                  Angaben speichern
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="text-sm text-green-700 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            QR-Layout wurde bereits freigegeben.
          </p>
        )}
      </section>
    </div>
  </div>
)}

          {/* 4. Online-Galerie */}
          {hatOnlineGalerie && (
  <div className="space-y-2">
    <h3 className="font-medium text-base">Online-Galerie</h3>

    <section className="rounded p-4 bg-white">
      {!galerie_aktiv ? (
        <p className="text-sm text-gray-500">Noch nicht verfügbar</p>
      ) : (
        <>
          {online_galerie_url && (
            <a href={online_galerie_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Galerie öffnen</a>
          )}
          {galerie_passwort && (
            <p className="text-sm mt-1">Passwort: {galerie_passwort}</p>
          )}
        </>
      )}
    </section>
  </div>
)}

{/* 5. Foto-Download */}
<div className="space-y-2">
  <h3 className="font-medium text-base">Fotodownload</h3>

  <section className={`rounded p-4 ${fotos_bereit ? 'bg-green-100' : 'bg-gray-100 opacity-60'}`}>
    {fotos_bereit ? (
      <div className="flex items-center justify-center gap-2">
        {/* Link-Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l1.414-1.414M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 5.656l-1.414 1.414" />
        </svg>

        {/* Link */}
        <a
          href={fotodownload_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          ZIP-Datei jetzt herunterladen
        </a>
      </div>
    ) : (
      <p className="text-sm text-gray-500">Fotos sind noch nicht bereitgestellt.</p>
    )}
  </section>
</div>
        </div>
      </div>

            <footer className="mt-12 py-6 border-t text-center text-sm text-gray-600 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p>&copy; {new Date().getFullYear()} Mr. Knips – Alle Rechte vorbehalten</p>
          <div className="space-x-4">
            <a href="https://www.mrknips.de" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Hauptseite
            </a>
            <a href="https://www.mrknips.de/impressum/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Impressum
            </a>
            <a href="https://www.mrknips.de/datenschutzerklaerung/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Datenschutz
            </a>
          </div>
        </div>
      </footer>
    </div>

    
  );
}

export default KundePage;
