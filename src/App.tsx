import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Lipunmyynti from "./Lipunmyynti";
import Login from "./login";
import Lipuntarkastus from "./Lipuntarkastus";

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/lipunmyynti" element={token ? <Lipunmyynti token={token} /> : <Navigate to="/login" />} />
        <Route path="/lipuntarkastus" element={token ? <Lipuntarkastus token={token} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;