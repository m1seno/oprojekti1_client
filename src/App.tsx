import { useState } from 'react'

type Lippu = {
  id: number
  koodi: string
  status: string
  // Lisää kenttiä tarvittaessa
}

function App() {
  const [koodi, setKoodi] = useState('')
  const [token, setToken] = useState('')
  const [lippu, setLippu] = useState<Lippu | null>(null)
  const [viesti, setViesti] = useState<string | null>(null)
  const [virhe, setVirhe] = useState<string | null>(null)

  const haeLippu = async () => {
    setViesti(null)
    setVirhe(null)
    setLippu(null)

    try {
      const res = await fetch(`/api/liput?koodi=${encodeURIComponent(koodi)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Lippua ei löytynyt')

      const data: Lippu = await res.json()
      setLippu(data)
    } catch (err) {
      if (err instanceof Error) {
        setVirhe(err.message)
      } else {
        setVirhe('Tuntematon virhe')
      }
    }
  }

  const kaytaLippu = async () => {
    if (!lippu) return
    setViesti(null)
    setVirhe(null)

    try {
      const res = await fetch(`/api/liput/${lippu.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Virhe lipun päivittämisessä')
      const paivitetty: Lippu = await res.json()
      setLippu(paivitetty)
      setViesti('Lippu merkittiin käytetyksi')
    } catch (err) {
      if (err instanceof Error) {
        setVirhe(err.message)
      } else {
        setVirhe('Tuntematon virhe')
      }
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Lipputarkistus</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Token:{' '}
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ width: '400px', marginLeft: '1rem' }}
            placeholder="Syötä JWT-token"
          />
        </label>
      </div>

      <label>
        Lippukoodi:{' '}
        <input
          value={koodi}
          onChange={(e) => setKoodi(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
      </label>
      <button onClick={haeLippu}>Hae</button>

      {virhe && <p style={{ color: 'red' }}> {virhe}</p>}
      {viesti && <p style={{ color: 'green' }}>{viesti}</p>}

      {lippu && (
        <div style={{ marginTop: '1rem' }}>
          <pre>{JSON.stringify(lippu, null, 2)}</pre>
          {lippu.status !== 'KÄYTETTY' && (
            <button onClick={kaytaLippu}>Merkitse käytetyksi</button>
          )}
        </div>
      )}
    </div>
  )
}

export default App