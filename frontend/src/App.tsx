import { Outlet } from "react-router-dom";
import { Header } from "./components/layout/Header.js";

export function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <Outlet />
    </div>
  );
}
