import { BrowserRouter, Routes, Route } from "react-router-dom";
import AngebotPage from "./pages/AngebotPage";
import KundePage from "./pages/KundePage"; // 👈 NEU

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/angebot/:token" element={<AngebotPage />} />
        <Route path="/kunde/:token" element={<KundePage />} /> {/* 👈 NEU */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
