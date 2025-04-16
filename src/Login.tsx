import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setToken }: { setToken: (token: string) => void }) => {
  const [email, setEmail] = useState("");
  const [salasana, setSalasana] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, salasana }),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Väärä sähköposti tai salasana");
          }
          throw new Error("Kirjautuminen epäonnistui");
        }
        return response.json();
      })
      .then((data) => {
        setToken(data.token);
        navigate("/lipunmyynti");
      })
      .catch((error) => {
        setError(error.message);
      });
  };
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kirjaudu sisään</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        type="email"
        placeholder="Sähköposti"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border mb-2"
      />
      <input
        type="password"
        placeholder="Salasana"
        value={salasana}
        onChange={(e) => setSalasana(e.target.value)}
        className="w-full p-2 border mb-4"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Kirjaudu
      </button>
    </div>
  );
};
export default Login;
