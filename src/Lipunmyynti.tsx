import { useEffect, useState } from "react";
// Asetetaan tyypit tapahtumille ja lipuille
interface Tapahtuma {
  tapahtumaId: number;
  tapahtumaNimi: string;
  aloitusaika: string;
}

interface Tapahtumalippu {
  tapahtumalippuId: number;
  hinta: number;
  asiakastyyppi: {
    asiakastyyppiId: number;
    asiakastyyppi: string;
  };
}

function Lipunmyynti({ token }: { token: string }) {
  const [tapahtumat, setTapahtumat] = useState<Tapahtuma[]>([]);
  const [valittuTapahtumaId, setValittuTapahtumaId] = useState<number | null>(null);
  const [tapahtumaliput, setTapahtumaliput] = useState<Tapahtumalippu[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<{ [id: number]: number }>({});
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");


  // Haetaan kaikki tapahtumat
  useEffect(() => {
    fetch("/api/tapahtumat/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Tapahtumien haku epäonnistui.");
        return res.json();
      })
      .then(data => setTapahtumat(data))
      .catch(err => {
        console.error(err);
        setMessage("Tapahtumien haku epäonnistui.");
      });
  }, [token]);

  // Haetaan tapahtumaliput tapahtumaId:n perusteella
  useEffect(() => {
    if (!valittuTapahtumaId) return;

    fetch(`/api/tapahtumaliput/${valittuTapahtumaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Tapahtumalippujen haku epäonnistui.");
        return res.json();
      })
      .then(data => setTapahtumaliput(data))
      .catch(err => {
        console.error(err);
        setMessage("Tapahtumalippujen haku epäonnistui.");
      });
  }, [valittuTapahtumaId, token]);

  // Tilamuuttuja päivittää valittujen lippujen määrät
  const handleQuantityChange = (id: number, qty: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [id]: qty
    }));
  };

  // Päivitetään sähköpostin tilamuuttuja
  const handleSubmit = () => {
    if (!valittuTapahtumaId) {
      setMessage("Valitse tapahtuma.");
      return;
    }

    // Otetaan talteen myyntitapahtuman tiedot
    const myyntiPayload = {
      myyntiaika: new Date().toISOString(),
      tyontekijaId: 1,
      email,
      liput: []
    };

    // Lähetetään POST-pyyntö myynnin tallentamiseksi
    fetch("/api/myynnit/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(myyntiPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Myynnin luonti epäonnistui.");
        return res.json();
      })
      .then(async (data) => {
        const myyntiId = data.myyntiId;

        const liput = Object.entries(selectedTickets)
          .flatMap(([id, count]) => Array(count).fill(Number(id)));

        for (const tapahtumalippuId of liput) {
          await fetch("/api/liput/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ myyntiId, tapahtumalippuId })
          });
        }

        setMessage(`Myynti onnistui! Myynti-ID: ${myyntiId}`);
        setEmail("");
        setSelectedTickets({});
      })
      .catch(err => {
        console.error(err);
        setMessage("Virhe myynnin tallennuksessa.");
      });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lipunmyynti</h1>

      {message && <p className="mb-2 text-blue-600">{message}</p>}

      <label className="block mb-2 font-semibold">Valitse tapahtuma:</label>
      {/* Näytetään lista tapahtumista */}
      <select
        value={valittuTapahtumaId ?? ""}
        onChange={e => setValittuTapahtumaId(Number(e.target.value))}
        className="w-full p-2 border mb-4"
      >
        <option value="" disabled>-- Valitse tapahtuma --</option>
        {tapahtumat.map(t => (
          <option key={t.tapahtumaId} value={t.tapahtumaId}>
            {t.tapahtumaNimi} ({new Date(t.aloitusaika).toLocaleString()})
          </option>
        ))}
      </select>

        {/* Pyydetään käyttäjää syöttämään asiakkaan sähköposti */}
      <input
        type="email"
        placeholder="Asiakkaan sähköposti"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-4 p-2 border"
      />

    
        {/* Näytetään tapahtumaliput, jos tapahtuma on valittu */}
      {tapahtumaliput.length > 0 && (
        <div>
          <label className="block mb-2 font-semibold">Valitse liput ja määrät:</label>
          {tapahtumaliput.map(l => (
            <div key={l.tapahtumalippuId} className="mb-3">
              <label className="block font-medium mb-1">
                {l.asiakastyyppi.asiakastyyppi} - {l.hinta.toFixed(2)} €
              </label>
              <input
                type="number"
                min={0}
                value={selectedTickets[l.tapahtumalippuId] || 0}
                onChange={(e) => handleQuantityChange(l.tapahtumalippuId, Number(e.target.value))}
                className="w-20 p-1 border"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Myy liput
      </button>
    </div>
  );
}

export default Lipunmyynti;
