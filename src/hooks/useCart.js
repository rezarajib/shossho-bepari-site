import { useContext, useMemo } from "react";
import { CartContext } from "../context/cartContextValue";
import { kgToMaund } from "../utils/unitConverter";

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const {
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    totalAmount,
    isDrawerOpen,
    setIsDrawerOpen,
  } = context;

  // কার্টের বিস্তারিত সারসংক্ষেপ (মোট আইটেম, ওজন, পাইকারি সাশ্রয়)
  const cartSummary = useMemo(() => {
    let totalItems = 0;
    let totalWeightKg = 0;
    let totalLiters = 0;
    let totalWholesaleSavings = 0;

    cart.forEach((item) => {
      totalItems += 1;
      if (item.unitType === "weight") {
        totalWeightKg += item.quantity;
      } else {
        totalLiters += item.quantity;
      }

      const regularCost = item.retailPrice * item.quantity;
      totalWholesaleSavings += Math.max(0, regularCost - item.calculatedTotal);
    });

    return {
      totalItems,
      totalWeightKg,
      totalLiters,
      totalWeightMaund: kgToMaund(totalWeightKg),
      totalWholesaleSavings,
      hasWholesaleItems: cart.some((item) => item.appliedRateType === "wholesale"),
    };
  }, [cart]);

  return {
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    totalAmount,
    isDrawerOpen,
    setIsDrawerOpen,
    ...cartSummary,
  };
};

export default useCart;