import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function AngebotPage() {
  const { token } = useParams();
  const [angebot, setAngebot] = useState(null);
  const [groupLeads, setGroupLeads] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState(null);
  const [form, setForm] = useState({
    vorname: "",
    nachname: "",
    telefon: "",
    email: "",
    firmenname: "",
    anschrift_strasse: "",
    anschrift_plz: "",
    anschrift_ort: "",
    rechnungsanschrift_strasse: "",
    rechnungsanschrift_plz: "",
    rechnungsanschrift_ort: "",
    gleicheRechnungsadresse: true,
    agb: false,
    datenschutz: false,
  });

  useEffect(() => {
    axios
      .get(`https://crm-lite-backend-production.up.railway.app/api/angebot/${token}`)
      .then((res) => {
        setAngebot(res.data);
        setGroupLeads(res.data.groupLeads || []);

        const lead = res.data.lead;
        if (lead.angebot_bestaetigt && lead.angebot_bestaetigt_am) {
          const datum = new Date(lead.angebot_bestaetigt_am).toLocaleDateString("de-DE");
          setConfirmedMessage(`✅ Dein Angebot wurde am ${datum} erfolgreich bestätigt. Eine E-Mail mit allen Details wurde an ${lead.email} verschickt.`);
        }

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

  const istFirmenkunde = angebot?.lead?.kundentyp?.toLowerCase().includes("firma");

  const validateFormBeforeConfirm = () => {
    if (!form.vorname || !form.nachname || !form.email || !form.anschrift_strasse || !form.anschrift_plz || !form.anschrift_ort) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }
    if (!form.agb || !form.datenschutz) {
      alert("Bitte akzeptiere die AGB und den Datenschutz.");
      return;
    }
    setShowModal(true);
  };

  const handleBuchen = async () => {
    try {
      const response = await axios.post(`https://crm-lite-backend-production.up.railway.app/api/angebot/${token}/bestaetigen`, {
        kontakt: {
          vorname: form.vorname,
          nachname: form.nachname,
          email: form.email,
          telefon: form.telefon,
          firmenname: form.firmenname,
        },
        rechnungsadresse: {
          anschrift_strasse: form.anschrift_strasse,
          anschrift_plz: form.anschrift_plz,
          anschrift_ort: form.anschrift_ort,
          rechnungsanschrift_strasse: form.gleicheRechnungsadresse ? form.anschrift_strasse : form.rechnungsanschrift_strasse,
          rechnungsanschrift_plz: form.gleicheRechnungsadresse ? form.anschrift_plz : form.rechnungsanschrift_plz,
          rechnungsanschrift_ort: form.gleicheRechnungsadresse ? form.anschrift_ort : form.rechnungsanschrift_ort,
          gleicheRechnungsadresse: form.gleicheRechnungsadresse,
        }
      });

      if (response.data.message === 'Angebot wurde bereits bestätigt.') {
        alert("⚠️ Dein Angebot wurde bereits bestätigt.");
        return;
      }
      if (response.data.success) {
        window.location.reload();
      } else {
        alert("❌ Fehler bei der Umwandlung. Bitte später erneut versuchen.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Netzwerkfehler. Bitte prüfe deine Internetverbindung oder kontaktiere den Support.");
    }
  };

  const sumForItems = (items = []) => items.reduce((sum, a) => sum + (parseFloat(a.einzelpreis) || 0) * (a.anzahl || 0), 0);

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!angebot) return <div className="p-4">Dein persönliches Angebot wird geladen...</div>;
  if (confirmedMessage) return <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow space-y-4"><h1 className="text-2xl font-bold">Bestätigung erfolgreich</h1><p>{confirmedMessage}</p></div>;

  const isGroup = Array.isArray(groupLeads) && groupLeads.length > 1;
  const renderArtikelList = (artikel) => (
    <ul className="list-disc pl-6 space-y-1">
      {[...(artikel || [])]
        .sort((a, b) => (a.artikel_name + a.variante_name).localeCompare(b.artikel_name + b.variante_name))
        .map((a) => (
          <li key={a.id}>
            {a.anzahl}x {a.artikel_name} {a.variante_name && `– ${a.variante_name}`} – {parseFloat(a.einzelpreis).toFixed(2)} €
            {a.bemerkung && <div className="text-sm text-gray-600">Hinweis: {a.bemerkung}</div>}
          </li>
        ))}
    </ul>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-8">
      <h1 className="text-2xl font-bold">Angebot für deine Fotobox-Erinnerungen 📸</h1>

      {!isGroup ? (
        <>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded border space-y-1">
              <h2 className="text-xl font-semibold mb-2">Dein Event</h2>
              <p><strong>Datum & Uhrzeit:</strong><br />
                {new Date(angebot.lead.event_datum).toLocaleDateString("de-DE")} &nbsp;
                {angebot.lead.event_startzeit?.slice(0, 5)} – {angebot.lead.event_endzeit?.slice(0, 5) || "spätestens am nächsten Vormittag"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded border space-y-1">
              <h2 className="text-xl font-semibold mb-2">Veranstaltungsort</h2>
              {angebot.locationInfo ? (
                <>
                  {angebot.locationInfo.name}<br />
                  {angebot.locationInfo.strasse}<br />
                  {angebot.locationInfo.plz} {angebot.locationInfo.ort}
                </>
              ) : (
                angebot.lead.event_ort
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <h2 className="text-xl font-semibold mb-2">Dein Angebot</h2>
              {renderArtikelList(angebot.artikel)}
              <div className="mt-2 font-bold">Gesamtsumme: {sumForItems(angebot.artikel).toFixed(2)} €</div>
            </div>
          </div>
        </>
      ) : (
        groupLeads.map((gl, idx) => (
          <div key={gl.id} className="space-y-6 border-t pt-6">
            <h2 className="text-xl font-semibold">Dein Event – Tag {idx + 1}</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-1">
              <strong>Datum & Uhrzeit:</strong><br />
              {new Date(gl.event_datum).toLocaleDateString("de-DE")} &nbsp;
              {gl.event_startzeit?.slice(0, 5)} – {gl.event_endzeit?.slice(0, 5) || "spätestens am nächsten Vormittag"}
            </div>
            <div className="bg-gray-50 p-4 rounded border space-y-1">
              <strong>Location:</strong><br />
              {gl.event_ort}
            </div>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <strong>Leistungen:</strong>
              {renderArtikelList(gl.artikel)}
              <div className="mt-2 font-bold">Zwischensumme Tag {idx + 1}: {sumForItems(gl.artikel).toFixed(2)} €</div>
            </div>
          </div>
        ))
      )}

      {/* Kontaktblock, Adresse, Buchung usw. bleibt gleich wie vorher */}
      {/* ... */}
    </div>
  );
}

export default AngebotPage;
