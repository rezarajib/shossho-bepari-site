import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getErpData,
  saveHaatEntry,
  updateShopLedger,
} from "../services/erpService";
import { APP_CONFIG } from "../constants/appConfig";
import { maundToKg } from "../utils/unitConverter";

export const useErpLedger = () => {
  const queryClient = useQueryClient();

  // ১. ব্রাউজার/সার্ভিস থেকে হাট ও ৭ দোকানের ডাটা লোড
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["erpData"],
    queryFn: getErpData,
  });

  const shops = useMemo(() => data?.shops ?? [], [data?.shops]);
  const haatList = useMemo(() => data?.haat ?? [], [data?.haat]);

  // ২. নতুন হাট ক্রয় এন্ট্রি মিউটেশন
  const addHaatMutation = useMutation({
    mutationFn: saveHaatEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
    },
  });

  // ৩. ৭ দোকানের সরিষার তেল ডেলিভারি ও জমা-বাকি মিউটেশন
  const updateShopMutation = useMutation({
    mutationFn: updateShopLedger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
    },
  });

  // ৪. হাট ও ৭ দোকানের অটোমেটিক লেজার সামারি ক্যালকুলেশন
  const ledgerSummary = useMemo(() => {
    const weeklyBudget = APP_CONFIG.weeklyHaatBudget; // ২,০০,০০০৳

    // হাটের মোট খরচ ও ক্রয়কৃত ওজন (মণ ও কেজি)
    const totalHaatSpent = haatList.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalHaatMaund = haatList.reduce((sum, item) => sum + Number(item.maund || 0), 0);
    const totalHaatKg = maundToKg(totalHaatMaund);
    const remainingHaatCash = weeklyBudget - totalHaatSpent;

    // ৭ নিয়মিত দোকানের তেল সরবরাহ, বিল, জমা ও বকেয়ার হিসাব
    const totalOilDeliveredLiters = shops.reduce((sum, s) => sum + Number(s.liters || 0), 0);
    const totalShopBilled = shops.reduce((sum, s) => sum + Number(s.totalBill || 0), 0);
    const totalShopPaid = shops.reduce((sum, s) => sum + Number(s.paid || 0), 0);
    const totalShopDue = shops.reduce((sum, s) => sum + Number(s.due || 0), 0);

    // যেসব দোকানে বাকি আছে তাদের সংখ্যা
    const shopsWithDueCount = shops.filter((s) => Number(s.due) > 0).length;

    return {
      weeklyBudget,
      totalHaatSpent,
      totalHaatMaund,
      totalHaatKg,
      remainingHaatCash,
      totalOilDeliveredLiters,
      totalShopBilled,
      totalShopPaid,
      totalShopDue,
      shopsWithDueCount,
    };
  }, [haatList, shops]);

  return {
    shops,
    haatList,
    isLoading,
    isError,
    error,
    ledgerSummary,
    addHaatEntry: addHaatMutation.mutateAsync,
    isAddingHaat: addHaatMutation.isPending,
    updateShopDelivery: updateShopMutation.mutateAsync,
    isUpdatingShop: updateShopMutation.isPending,
  };
};

export default useErpLedger;