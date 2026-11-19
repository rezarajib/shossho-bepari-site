import { useState } from "react";
import { CartContext } from "./cartContextValue";
import { calculateSmartBill } from "../utils/unitConverter";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addToCart = (product, selection) => {
    const bill = selection?.calculatedTotal !== undefined
      ? selection
      : calculateSmartBill(product, 1);
    if (bill.quantity <= 0 || bill.calculatedTotal <= 0) return;

    const key = product.id;
    setCart((prev) => {
      const exists = prev.find((i) => i.key === key);
      if (exists) {
        return prev.map((item) => {
          if (item.key !== key) return item;

          const combinedBill = calculateSmartBill(product, item.quantity + bill.quantity);
          return {
            ...item,
            ...combinedBill,
            qty: combinedBill.quantity,
            price: combinedBill.calculatedTotal,
            isWholesale: combinedBill.appliedRateType === "wholesale",
          };
        });
      }
      return [
        ...prev,
        {
          ...product,
          ...bill,
          key,
          qty: bill.quantity,
          price: bill.calculatedTotal,
          isWholesale: bill.appliedRateType === "wholesale",
        },
      ];
    });
    setIsDrawerOpen(true);
  };

  const updateQty = (key, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key !== key) return item;
          const updatedBill = calculateSmartBill(item, item.quantity + delta);
          return {
            ...item,
            ...updatedBill,
            qty: updatedBill.quantity,
            price: updatedBill.calculatedTotal,
            isWholesale: updatedBill.appliedRateType === "wholesale",
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => setCart([]);
  const totalAmount = cart.reduce((sum, item) => sum + item.calculatedTotal, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeFromCart, clearCart, totalAmount, isDrawerOpen, setIsDrawerOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};