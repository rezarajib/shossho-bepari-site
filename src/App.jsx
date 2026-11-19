// src/App.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./context/CartContext";
import AppRouter from "./routes/Router";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </QueryClientProvider>
  );
}