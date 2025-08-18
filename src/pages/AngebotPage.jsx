import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const [feedback, setFeedback] = useState("");
const [feedbackEmail, setFeedbackEmail] = useState("");
const [feedbackStatus, setFeedbackStatus] = useState(null); // {type:'ok'|'err', msg:string}

function AngebotPage() {
  const { token } = useParams();
  const [angebot, setAngebot] = useState(null);
  const [groupLeads, setGroupLeads] = useState([]); // 👈 Multi-Day
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
        setGroupLeads(res.data.groupLeads || []); // 👈 Artikel kommen hier bereits mit

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

  const istFirmenkunde = angebot?.lead?.kundentyp?.toLowerCase()?.includes("firma") || false;

  const validateFormBeforeConfirm = () => {
    if (
      !form.vorname || !form.nachname || !form.email ||
      !form.anschrift_strasse || !form.anschrift_plz || !form.anschrift_ort
    ) {
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
      const response = await axios.post(
        `https://crm-lite-backend-production.up.railway.app/api/angebot/${token}/bestaetigen`,
        {
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
        }
      );

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

  const handleSendFeedback = async () => {
  if (!feedback || feedback.trim().length < 3) {
    setFeedbackStatus({ type: 'err', msg: 'Bitte eine Nachricht mit mindestens 3 Zeichen schreiben.' });
    return;
  }
  try {
    const response = await axios.post(
      `https://crm-lite-backend-production.up.railway.app/api/angebot/${token}/feedback`,
      { message: feedback.trim(), email: feedbackEmail?.trim() || undefined }
    );

    if (response.data?.success) {
      setFeedback("");
      setFeedbackStatus({ type: 'ok', msg: 'Danke! Deine Nachricht wurde übermittelt.' });
    } else {
      setFeedbackStatus({ type: 'err', msg: response.data?.message || 'Konnte nicht gesendet werden.' });
    }
  } catch (e) {
    console.error(e);
    setFeedbackStatus({ type: 'err', msg: 'Netzwerkfehler beim Senden. Bitte später erneut versuchen.' });
  }
};

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!angebot) return <div className="p-4">Dein persönliches Angebot wird geladen...</div>;

  // --- Helfer: Summen ---
  const sumForItems = (items = []) =>
    items.reduce((sum, a) => sum + (parseFloat(a.einzelpreis) || 0) * (a.anzahl || 0), 0);

  const singleSum = sumForItems(angebot.artikel || []);
  const multiTotal = groupLeads.reduce((tot, gl) => tot + sumForItems(gl.artikel || []), 0);

  if (confirmedMessage) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow space-y-4">
        <h1 className="text-2xl font-bold">Bestätigung erfolgreich</h1>
        <p>{confirmedMessage}</p>
      </div>
    );
  }

  const isGroup = Array.isArray(groupLeads) && groupLeads.length > 1; // mehrere Tage

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-8">
      <h1 className="text-2xl font-bold">Angebot für deine Fotobox-Erinnerungen 📸</h1>

      {isGroup && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <strong>Mehrere Tage in deinem Angebot</strong><br />
          Unten findest du alle Tage deiner Anfrage – jeweils mit Eventdetails, Leistungen und Zwischensumme.
        </div>
      )}

      {!isGroup ? (
        <>
          {/* Single-Day Darstellung (wie gehabt) */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Dein Event</h2>
            <p><strong>Datum:</strong> {new Date(angebot.lead.event_datum).toLocaleDateString("de-DE")}</p>
            <p><strong>Location:</strong> {angebot.lead.event_ort}</p>
            <p><strong>Startzeit:</strong> {angebot.lead.event_startzeit?.slice(0, 5)}</p>
            <p><strong>Endzeit:</strong> {angebot.lead.event_endzeit ? angebot.lead.event_endzeit.slice(0, 5) : "spätestens am nächsten Vormittag"}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Dein Angebot</h2>
            <ul className="list-disc pl-6 space-y-1">
              {(angebot.artikel || []).map((a) => (
                <li key={a.id}>
                  {a.anzahl}x {a.variante_name} – {parseFloat(a.einzelpreis).toFixed(2)} €
                  {a.bemerkung && (<div className="text-sm text-gray-600">Hinweis: {a.bemerkung}</div>)}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-lg font-bold">Gesamtsumme: {singleSum.toFixed(2)} €</div>
          </div>
        </>
      ) : (
        <>
          {/* Multi-Day Darstellung */}
          {groupLeads.map((gl, idx) => {
            const sub = sumForItems(gl.artikel || []);
            return (
              <div key={gl.id} className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-2">Dein Event – Tag {idx + 1}</h2>
                <p><strong>Datum:</strong> {new Date(gl.event_datum).toLocaleDateString("de-DE")}</p>
                <p><strong>Location:</strong> {gl.event_ort}</p>
                <p><strong>Startzeit:</strong> {gl.event_startzeit ? gl.event_startzeit.slice(0, 5) : "-"}</p>
                <p><strong>Endzeit:</strong> {gl.event_endzeit ? gl.event_endzeit.slice(0, 5) : "spätestens am nächsten Vormittag"}</p>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Dein Angebot – Tag {idx + 1}</h3>
                  {Array.isArray(gl.artikel) && gl.artikel.length > 0 ? (
                    <>
                      <ul className="list-disc pl-6 space-y-1">
                        {gl.artikel.map((a) => (
                          <li key={a.id}>
                            {a.anzahl}x {a.variante_name} – {parseFloat(a.einzelpreis).toFixed(2)} €
                            {a.bemerkung && (<div className="text-sm text-gray-600">Hinweis: {a.bemerkung}</div>)}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 font-bold">Zwischensumme Tag {idx + 1}: {sub.toFixed(2)} €</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600">
                      (Für diesen Tag sind aktuell keine Artikel hinterlegt.)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="mt-6 p-4 bg-gray-50 rounded border">
            <div className="text-lg font-bold">Gesamtsumme (alle Tage): {multiTotal.toFixed(2)} €</div>
          </div>
        </>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Deine Kontaktdaten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Vorname*" value={form.vorname} onChange={(e) => setForm({ ...form, vorname: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Nachname*" value={form.nachname} onChange={(e) => setForm({ ...form, nachname: e.target.value })} />
          <input className="border p-2 rounded col-span-2" placeholder="Telefon" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
          <input className="border p-2 rounded col-span-2" placeholder="E-Mail*" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>

      {istFirmenkunde && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Firmendaten</h2>
          <input className="border p-2 rounded col-span-2 w-full" placeholder="Firmenname" value={form.firmenname} onChange={(e) => setForm({ ...form, firmenname: e.target.value })} />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Anschrift</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-2 rounded col-span-2" placeholder="Straße & Nr.*" value={form.anschrift_strasse} onChange={(e) => setForm({ ...form, anschrift_strasse: e.target.value })} />
        <input className="border p-2 rounded" placeholder="PLZ*" value={form.anschrift_plz} onChange={(e) => setForm({ ...form, anschrift_plz: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Ort*" value={form.anschrift_ort} onChange={(e) => setForm({ ...form, anschrift_ort: e.target.value })} />
      </div>

      <label className="flex items-center space-x-2 mb-2">
        <input type="checkbox" checked={!form.gleicheRechnungsadresse} onChange={(e) => setForm({ ...form, gleicheRechnungsadresse: !e.target.checked })} />
        <span>Abweichende Rechnungsadresse angeben</span>
      </label>

      {!form.gleicheRechnungsadresse && (
        <>
          <h2 className="text-xl font-semibold mb-2">Rechnungsanschrift</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded col-span-2" placeholder="Straße & Nr. (Rechnung)*" value={form.rechnungsanschrift_strasse} onChange={(e) => setForm({ ...form, rechnungsanschrift_strasse: e.target.value })} />
            <input className="border p-2 rounded" placeholder="PLZ (Rechnung)*" value={form.rechnungsanschrift_plz} onChange={(e) => setForm({ ...form, rechnungsanschrift_plz: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Ort (Rechnung)*" value={form.rechnungsanschrift_ort} onChange={(e) => setForm({ ...form, rechnungsanschrift_ort: e.target.value })} />
          </div>
        </>
      )}

            {/* --- Feedback ohne Bestätigung --- */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">Fragen oder Änderungswünsche?</h2>
        <p className="mb-3">
          Du kannst uns hier eine Nachricht schicken – ganz ohne das Angebot bereits zu bestätigen.
        </p>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded col-span-2 md:col-span-1"
            placeholder="Deine E-Mail (optional)"
            value={feedbackEmail}
            onChange={(e) => setFeedbackEmail(e.target.value)}
          />
          <div className="col-span-2">
            <textarea
              className="border p-2 rounded w-full h-28"
              placeholder="Deine Nachricht an uns …"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>
      
        <div className="mt-3 flex items-center gap-3">
          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSendFeedback}
          >
            Nachricht senden
          </button>
          {feedbackStatus && (
            <span className={feedbackStatus.type === 'ok' ? 'text-green-700' : 'text-red-700'}>
              {feedbackStatus.msg}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.agb} onChange={(e) => setForm({ ...form, agb: e.target.checked })} />
          <span>Ich akzeptiere die <a href="https://mrknips.de/allgemeine-geschaeftsbedingungen/" target="_blank" className="text-blue-600 underline">AGB</a>*</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.datenschutz} onChange={(e) => setForm({ ...form, datenschutz: e.target.checked })} />
          <span>Ich akzeptiere die <a href="https://mrknips.de/datenschutzerklaerung/" target="_blank" className="text-blue-600 underline">Datenschutzbestimmungen</a>*</span>
        </label>
      </div>

      {!angebot.lead.angebot_bestaetigt ? (
        <>
          <button
            className="mt-4 px-6 py-3 rounded w-full text-lg bg-green-600 hover:bg-green-700 text-white"
            onClick={validateFormBeforeConfirm}
          >
            Angebot verbindlich buchen
          </button>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Angebot bestätigen?</h2>
                <p className="mb-4">Mit dem Klick auf „Jetzt bestätigen“ wird dein Angebot verbindlich gebucht.</p>
                <div className="flex justify-end space-x-4">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Abbrechen</button>
                  <button onClick={() => { setShowModal(false); handleBuchen(); }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Jetzt bestätigen</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <button className="mt-4 px-6 py-3 rounded w-full text-lg bg-gray-400 cursor-not-allowed" disabled>
          Angebot bereits bestätigt
        </button>
      )}
    </div>
  );
}

export default AngebotPage;
