import { Outlet } from "react-router-dom";
import Navbar from "./shared/Navbar";
import CartDrawer from "../components/checkout/CartDrawer";
import Footer from "./shared/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
}