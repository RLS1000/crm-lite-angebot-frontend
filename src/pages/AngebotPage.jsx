import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://crm-lite-backend-production.up.railway.app";

function AngebotPage() {
  const { token } = useParams();

  // Basiszustand (Single-Lead-Rückgabe der bestehenden Route)
  const [angebot, setAngebot] = useState(null); // {success, lead, artikel}
  const [error, setError] = useState(null);

  // Grouping
  const [groupLeads, setGroupLeads] = useState([]); // reine Metadaten der Gruppe
  const [groupDetails, setGroupDetails] = useState([]); // [{lead, artikel}] sortiert
  const [isGrouped, setIsGrouped] = useState(false);

  // UI
  const [showModal, setShowModal] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState(null);

  // Auswahl: pro LeadId ein Tri-State: true (Ja), false (Nein), null (nicht entschieden)
  const [selections, setSelections] = useState({});

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

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  const fmtEuro = (n) =>
    (Number.isFinite(n) ? n : parseFloat(n || 0))
      .toFixed(2)
      .replace(".", ",");

  const sumArtikel = (artikel = []) =>
    artikel.reduce((s, a) => s + parseFloat(a.einzelpreis) * a.anzahl, 0);

  const sortByDateTime = (arr) =>
    [...arr].sort((a, b) => {
      const ad = new Date(a.lead?.event_datum || a.event_datum || 0).getTime();
      const bd = new Date(b.lead?.event_datum || b.event_datum || 0).getTime();
      if (ad !== bd) return ad - bd;
      const at = (a.lead?.event_startzeit || a.event_startzeit || "").slice(0, 5);
      const bt = (b.lead?.event_startzeit || b.event_startzeit || "").slice(0, 5);
      return at.localeCompare(bt);
    });

  const gesamtSingle = useMemo(() => {
    if (!angebot?.artikel) return "0.00";
    return sumArtikel(angebot.artikel).toFixed(2);
  }, [angebot]);

  const gesamtGroup = useMemo(() => {
    if (!groupDetails.length) return "0.00";
    return groupDetails.reduce((s, d) => s + sumArtikel(d.artikel || []), 0).toFixed(2);
  }, [groupDetails]);

  // ------------------------------------------------------------
  // Initial Load
  // ------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // 1) Basisdaten für den Token-Lead laden
        const res = await axios.get(`${API_BASE}/api/angebot/${token}`);
        if (!mounted) return;

        setAngebot(res.data);

        const lead = res.data.lead || {};
        // Bestätigungsbanner wie gehabt
        if (lead.angebot_bestaetigt && lead.angebot_bestaetigt_am) {
          const datum = new Date(lead.angebot_bestaetigt_am).toLocaleDateString("de-DE");
          setConfirmedMessage(
            `✅ Dein Angebot wurde am ${datum} erfolgreich bestätigt. Eine E-Mail mit allen Details wurde an ${lead.email} verschickt.`
          );
        }

        // Formular anreichern
        setForm((prev) => ({
          ...prev,
          vorname: lead.vorname || "",
          nachname: lead.nachname || "",
          email: lead.email || "",
          telefon: lead.telefon || "",
          firmenname: lead.firmenname || "",
        }));

        // 2) Grouping prüfen
        if (lead.group_id) {
          setIsGrouped(true);
          // alle Leads dieser Gruppe laden
          const gres = await axios.get(`${API_BASE}/api/leads/group/${lead.group_id}`);
          if (!mounted) return;

          const leads = Array.isArray(gres.data) ? gres.data : [];
          setGroupLeads(leads);

          // Für jedes Gruppen-Lead die Angebotsdetails nachladen
          // -> Wir nutzen vorhandene Detail-Route: /api/angebot/by-lead/:id
          //    Falls diese noch NICHT existiert, wird der Catch greifen und
          //    wir zeigen wenigstens Event-Infos ohne Artikel an.
          const details = await Promise.all(
            leads.map(async (l) => {
              try {
                const dres = await axios.get(`${API_BASE}/api/angebot/by-lead/${l.id}`);
                return { lead: dres.data.lead, artikel: dres.data.artikel || [] };
              } catch {
                // Fallback: Nur Lead anzeigen, keine Artikel (bis Backend-Routenerweiterung aktiv ist)
                return { lead: l, artikel: [] };
              }
            })
          );

          // sortiert speichern
          setGroupDetails(sortByDateTime(details));

          // Vorauswahl-Status: alles auf "nicht entschieden" (null)
          const initSel = {};
          for (const l of leads) initSel[l.id] = null;
          setSelections(initSel);
        } else {
          setIsGrouped(false);
        }
      } catch (err) {
        console.error("Fehler beim Laden des Angebots:", err);
        setError("Angebot konnte nicht geladen werden.");
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  // ------------------------------------------------------------
  // Validierungen
  // ------------------------------------------------------------
  const istFirmenkunde = angebot?.lead?.kundentyp?.toLowerCase().includes("firma");

  const validateFormBeforeConfirm = () => {
    if (
      !form.vorname ||
      !form.nachname ||
      !form.email ||
      !form.anschrift_strasse ||
      !form.anschrift_plz ||
      !form.anschrift_ort
    ) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    if (!form.agb || !form.datenschutz) {
      alert("Bitte akzeptiere die AGB und den Datenschutz.");
      return;
    }

    if (isGrouped) {
      // Jede Zeile muss Ja (true) oder Nein (false) gesetzt sein
      const undecided = Object.values(selections).some((v) => v === null);
      if (undecided) {
        alert("Bitte entscheide für jeden Tag: Ja oder Nein.");
        return;
      }
      // Mindestens ein Tag muss auf Ja stehen
      const anySelected = Object.values(selections).some((v) => v === true);
      if (!anySelected) {
        alert("Bitte wähle mindestens einen Tag (Ja) aus.");
        return;
      }
    }

    setShowModal(true);
  };

  // ------------------------------------------------------------
  // Buchen
  // ------------------------------------------------------------
  const handleBuchen = async () => {
    try {
      if (!isGrouped) {
        // Single: bestehende Token-Route
        const response = await axios.post(
          `${API_BASE}/api/angebot/${token}/bestaetigen`,
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
              rechnungsanschrift_strasse: form.gleicheRechnungsadresse
                ? form.anschrift_strasse
                : form.rechnungsanschrift_strasse,
              rechnungsanschrift_plz: form.gleicheRechnungsadresse
                ? form.anschrift_plz
                : form.rechnungsanschrift_plz,
              rechnungsanschrift_ort: form.gleicheRechnungsadresse
                ? form.anschrift_ort
                : form.rechnungsanschrift_ort,
              gleicheRechnungsadresse: form.gleicheRechnungsadresse,
            },
          }
        );

        if (response.data.message === "Angebot wurde bereits bestätigt.") {
          alert("⚠️ Dein Angebot wurde bereits bestätigt.");
          return;
        }

        if (response.data.success) {
          window.location.reload();
        } else {
          alert("❌ Fehler bei der Umwandlung. Bitte später erneut versuchen.");
        }
        return;
      }

      // Grouped: für alle ausgewählten Leads einzeln die bestehende Conversion-Route nutzen
      const selectedIds = Object.entries(selections)
        .filter(([, v]) => v === true)
        .map(([id]) => id);

      for (const leadId of selectedIds) {
        // wichtig: dieselben Kontaktdaten/Rechnungsdaten verwenden
        await axios.post(`${API_BASE}/api/lead/${leadId}/convert-to-booking`, {
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
            rechnungsanschrift_strasse: form.gleicheRechnungsadresse
              ? form.anschrift_strasse
              : form.rechnungsanschrift_strasse,
            rechnungsanschrift_plz: form.gleicheRechnungsadresse
              ? form.anschrift_plz
              : form.rechnungsanschrift_plz,
            rechnungsanschrift_ort: form.gleicheRechnungsadresse
              ? form.anschrift_ort
              : form.rechnungsanschrift_ort,
            gleicheRechnungsadresse: form.gleicheRechnungsadresse,
          },
        });
      }

      alert("✅ Deine Auswahl wurde erfolgreich bestätigt!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("❌ Netzwerkfehler. Bitte prüfe deine Internetverbindung oder kontaktiere den Support.");
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!angebot) return <div className="p-4">Dein persönliches Angebot wird geladen...</div>;

  // Single Lead Darstellung (Fallback/Standard)
  const singleEventBlock = (
    <>
      <div>
        <h2 className="text-xl font-semibold mb-2">Dein Event</h2>
        <p><strong>Datum:</strong> {new Date(angebot.lead.event_datum).toLocaleDateString("de-DE")}</p>
        <p><strong>Location:</strong> {angebot.lead.event_ort}</p>
        <p><strong>Startzeit:</strong> {angebot.lead.event_startzeit?.slice(0, 5)}</p>
        <p>
          <strong>Endzeit:</strong>{" "}
          {angebot.lead.event_endzeit ? angebot.lead.event_endzeit.slice(0, 5) : "spätestens am nächsten Vormittag"}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Dein Angebot</h2>
        <ul className="list-disc pl-6 space-y-1">
          {angebot.artikel.map((a) => (
            <li key={a.id}>
              {a.anzahl}x {a.variante_name} – {fmtEuro(parseFloat(a.einzelpreis))} €
              {a.bemerkung && <div className="text-sm text-gray-600">Hinweis: {a.bemerkung}</div>}
            </li>
          ))}
        </ul>
        <div className="mt-4 text-lg font-bold">Gesamtsumme: {fmtEuro(parseFloat(gesamtSingle))} €</div>
      </div>
    </>
  );

  // Group Darstellung
  const groupBlock = (
    <>
      <div className="p-3 border rounded bg-yellow-50 text-yellow-900">
        <strong>Hinweis:</strong> Dein Angebot enthält mehrere Tage. Bitte entscheide für jeden Tag, ob du ihn verbindlich buchen möchtest.
      </div>

      {groupDetails.map((d, idx) => {
        const subtotal = sumArtikel(d.artikel || []);
        const decided = selections[d.lead.id];
        const dateStr = new Date(d.lead.event_datum).toLocaleDateString("de-DE");
        const start = d.lead.event_startzeit ? d.lead.event_startzeit.slice(0, 5) : "";
        const end = d.lead.event_endzeit ? d.lead.event_endzeit.slice(0, 5) : "";

        return (
          <div key={d.lead.id} className="border rounded p-4 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Dein Event – Tag {idx + 1}
              </h2>
              <p><strong>Datum:</strong> {dateStr}</p>
              <p><strong>Location:</strong> {d.lead.event_ort}</p>
              <p><strong>Startzeit:</strong> {start}</p>
              <p><strong>Endzeit:</strong> {end || "spätestens am nächsten Vormittag"}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Dein Angebot</h2>
              {d.artikel?.length ? (
                <>
                  <ul className="list-disc pl-6 space-y-1">
                    {d.artikel.map((a) => (
                      <li key={`${d.lead.id}-${a.id || a.artikel_variante_id}`}>
                        {a.anzahl}x {a.variante_name} – {fmtEuro(parseFloat(a.einzelpreis))} €
                        {a.bemerkung && <div className="text-sm text-gray-600">Hinweis: {a.bemerkung}</div>}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 font-semibold">
                    Zwischensumme (Tag {idx + 1}): {fmtEuro(subtotal)} €
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  (Die Artikel dieses Tages konnten nicht geladen werden – bitte später erneut prüfen.)
                </div>
              )}
            </div>

            <div className="mt-2">
              <div className="font-medium mb-1">Diesen Tag verbindlich buchen?</div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`sel-${d.lead.id}`}
                    checked={decided === true}
                    onChange={() => setSelections((s) => ({ ...s, [d.lead.id]: true }))}
                  />
                  <span>Ja</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`sel-${d.lead.id}`}
                    checked={decided === false}
                    onChange={() => setSelections((s) => ({ ...s, [d.lead.id]: false }))}
                  />
                  <span>Nein</span>
                </label>
                {decided === null && <span className="text-sm text-gray-500">(Bitte auswählen)</span>}
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-4 text-lg font-bold">
        Gesamtsumme: {fmtEuro(parseFloat(gesamtGroup))} €
      </div>
    </>
  );

  // ------------------------------------------------------------
  // UI Output
  // ------------------------------------------------------------
  if (confirmedMessage) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow space-y-4">
        <h1 className="text-2xl font-bold">Bestätigung erfolgreich</h1>
        <p>{confirmedMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-8">
      <h1 className="text-2xl font-bold">Angebot für deine Fotobox-Erinnerungen 📸</h1>

      {!isGrouped && singleEventBlock}
      {isGrouped && groupBlock}

      {/* Kontaktdaten */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Deine Kontaktdaten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Vorname*" value={form.vorname} onChange={(e) => setForm({ ...form, vorname: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Nachname*" value={form.nachname} onChange={(e) => setForm({ ...form, nachname: e.target.value })} />
          <input className="border p-2 rounded col-span-2" placeholder="Telefon" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
          <input className="border p-2 rounded col-span-2" placeholder="E-Mail*" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>

      {/* Firmendaten nur wenn Firmenkunde */}
      {angebot?.lead?.kundentyp?.toLowerCase().includes("firma") && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Firmendaten</h2>
          <input className="border p-2 rounded col-span-2 w-full" placeholder="Firmenname" value={form.firmenname} onChange={(e) => setForm({ ...form, firmenname: e.target.value })} />
        </div>
      )}

      {/* Anschrift */}
      <h2 className="text-xl font-semibold mb-2">Anschrift</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-2 rounded col-span-2" placeholder="Straße & Nr.*" value={form.anschrift_strasse} onChange={(e) => setForm({ ...form, anschrift_strasse: e.target.value })} />
        <input className="border p-2 rounded" placeholder="PLZ*" value={form.anschrift_plz} onChange={(e) => setForm({ ...form, anschrift_plz: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Ort*" value={form.anschrift_ort} onChange={(e) => setForm({ ...form, anschrift_ort: e.target.value })} />
      </div>

      {/* Abweichende Rechnungsadresse */}
      <label className="flex items-center space-x-2 mb-2">
        <input
          type="checkbox"
          checked={!form.gleicheRechnungsadresse}
          onChange={(e) => setForm({ ...form, gleicheRechnungsadresse: !e.target.checked })}
        />
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

      {/* AGB/Datenschutz */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.agb} onChange={(e) => setForm({ ...form, agb: e.target.checked })} />
          <span>
            Ich akzeptiere die{" "}
            <a href="https://mrknips.de/allgemeine-geschaeftsbedingungen/" target="_blank" className="text-blue-600 underline" rel="noreferrer">
              AGB
            </a>
            *
          </span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.datenschutz} onChange={(e) => setForm({ ...form, datenschutz: e.target.checked })} />
          <span>
            Ich akzeptiere die{" "}
            <a href="https://mrknips.de/datenschutzerklaerung/" target="_blank" className="text-blue-600 underline" rel="noreferrer">
              Datenschutzbestimmungen
            </a>
            *
          </span>
        </label>
      </div>

      {/* Buttons */}
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
                <p className="mb-4">
                  Mit dem Klick auf „Jetzt bestätigen“ {isGrouped ? "werden die ausgewählten Tage verbindlich gebucht." : "wird dein Angebot verbindlich gebucht."}
                </p>
                <div className="flex justify-end space-x-4">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                    Abbrechen
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleBuchen();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Jetzt bestätigen
                  </button>
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
