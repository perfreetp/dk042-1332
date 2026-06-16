import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Inspection from "@/pages/Inspection";
import Rollcall from "@/pages/Rollcall";
import Review from "@/pages/Review";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inspection" element={<Inspection />} />
        <Route path="/rollcall" element={<Rollcall />} />
        <Route path="/review" element={<Review />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
