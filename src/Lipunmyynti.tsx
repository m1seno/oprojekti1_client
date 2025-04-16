// src/Lipunmyynti.tsx
import { useEffect, useState } from "react";

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
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
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

  // Hae tapahtumaliput tapahtumaId:n perusteella
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

  const handleCheckboxChange = (id: number) => {
    setSelectedTickets(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!valittuTapahtumaId || !selectedTickets.length || !email) {
      setMessage("Täytä kaikki tiedot ja valitse vähintään yksi lippu.");
      return;
    }

    const payload = {
      myyntiaika: new Date().toISOString(),
      tyontekijaId: 1,
      email,
      liput: selectedTickets.map(id => ({ tapahtumalippuId: id }))
    };

    fetch("/api/myynnit/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Myynnin luonti epäonnistui.");
        return res.json();
      })
      .then(data => {
        setMessage(`Myynti onnistui! Myynti-ID: ${data.myyntiId}`);
        setEmail("");
        setSelectedTickets([]);
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

      <input
        type="email"
        placeholder="Asiakkaan sähköposti"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-4 p-2 border"
      />

      {tapahtumaliput.length > 0 && (
        <div>
          <label className="block mb-2 font-semibold">Valitse liput:</label>
          {tapahtumaliput.map(l => (
            <label key={l.tapahtumalippuId} className="block mb-2">
              <input
                type="checkbox"
                checked={selectedTickets.includes(l.tapahtumalippuId)}
                onChange={() => handleCheckboxChange(l.tapahtumalippuId)}
                className="mr-2"
              />
              {l.asiakastyyppi.asiakastyyppi} – {l.hinta.toFixed(2)} €
            </label>
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
