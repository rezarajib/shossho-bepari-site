import initialShops from "../data/sevenShops.json";
import initialHaat from "../data/haatPurchases.json";
import { APP_CONFIG } from "../constants/appConfig";

const SHOPS_KEY = "shossho_bepari_shops_v1";
const HAAT_KEY = "shossho_bepari_haat_v1";
const DIRECT_FARM_KEY = "shossho_bepari_direct_farm_v1";
const FUND_KEY = "shossho_bepari_haat_fund_v1";
const MILLING_KEY = "shossho_bepari_milling_v1";
const MILL_TRUCK_KEY = "shossho_bepari_mill_truck_v1";
const CROP_FIELDS_KEY = "shossho_bepari_crop_fields_v1";
const FARMER_BOOKINGS_KEY = "shossho_bepari_farmer_bookings_v1";
const INDUSTRIAL_QUOTES_KEY = "shossho_bepari_industrial_quotes_v1";

const initialCropFields = [
  {
    id: "field-001",
    farmerName: "আব্দুল করিম",
    phone: "",
    village: "চাপড়া",
    union: "চাপড়া ইউনিয়ন",
    crop: "সরিষা",
    variety: "বারি সরিষা-১৪",
    season: "rabi",
    areaBigha: 5,
    estimatedMaund: 48,
    stockMaund: 0,
    weeklyHarvestMaund: 0,
    status: "ripening",
    harvestDays: 15,
  },
  {
    id: "field-002",
    farmerName: "মোছা. রহিমা খাতুন",
    phone: "",
    village: "যদুবয়রা",
    union: "যদুবয়রা ইউনিয়ন",
    crop: "তিল",
    variety: "দেশি কালো তিল",
    season: "kharif1",
    areaBigha: 3.5,
    estimatedMaund: 24,
    stockMaund: 35,
    weeklyHarvestMaund: 0,
    status: "stock",
    harvestDays: 0,
  },
  {
    id: "field-003",
    farmerName: "মো. নাসির উদ্দিন",
    phone: "",
    village: "বাগুলাট",
    union: "বাগুলাট ইউনিয়ন",
    crop: "ধান",
    variety: "আমন",
    season: "kharif2",
    areaBigha: 7,
    estimatedMaund: 82,
    stockMaund: 0,
    weeklyHarvestMaund: 30,
    status: "harvesting",
    harvestDays: 0,
  },
  {
    id: "field-004",
    farmerName: "আলমগীর হোসেন",
    phone: "",
    village: "পান্টি",
    union: "পান্টি ইউনিয়ন",
    crop: "গম",
    variety: "বারি গম-৩৩",
    season: "rabi",
    areaBigha: 6,
    estimatedMaund: 55,
    stockMaund: 0,
    weeklyHarvestMaund: 0,
    status: "growing",
    harvestDays: 60,
  },
  {
    id: "field-005",
    farmerName: "মো. জহুরুল ইসলাম",
    phone: "",
    village: "কয়া",
    union: "কয়া ইউনিয়ন",
    crop: "ভুট্টা",
    variety: "বারি হাইব্রিড ভুট্টা",
    season: "rabi",
    areaBigha: 4,
    estimatedMaund: 46,
    stockMaund: 0,
    weeklyHarvestMaund: 0,
    status: "ripening",
    harvestDays: 12,
  },
  {
    id: "field-006",
    farmerName: "মোছা. সালমা বেগম",
    phone: "",
    village: "চরসাদীপুর",
    union: "সদকী ইউনিয়ন",
    crop: "পাট",
    variety: "দেশি তোষা পাট",
    season: "kharif1",
    areaBigha: 2.5,
    estimatedMaund: 18,
    stockMaund: 0,
    weeklyHarvestMaund: 0,
    status: "growing",
    harvestDays: 45,
  },
  {
    id: "field-007",
    farmerName: "মো. ইমরান মোল্লা",
    phone: "",
    village: "সদকী",
    union: "সদকী ইউনিয়ন",
    crop: "কালোজিরা",
    variety: "দেশি কালোজিরা",
    season: "rabi",
    areaBigha: 2,
    estimatedMaund: 12,
    stockMaund: 0,
    weeklyHarvestMaund: 0,
    status: "growing",
    harvestDays: 35,
  },
  {
    id: "field-008",
    farmerName: "মো. রফিকুল ইসলাম",
    phone: "",
    village: "শিলাইদহ",
    union: "শিলাইদহ ইউনিয়ন",
    crop: "মাষকলাই",
    variety: "দেশি মাষকলাই",
    season: "kharif2",
    areaBigha: 3,
    estimatedMaund: 20,
    stockMaund: 0,
    weeklyHarvestMaund: 0,
    status: "growing",
    harvestDays: 28,
  },
  {
    id: "field-009",
    farmerName: "মোছা. জাহানারা খাতুন",
    phone: "",
    village: "কুমারখালী",
    union: "কুমারখালী পৌরসভা",
    crop: "খেসারি",
    variety: "দেশি খেসারি",
    season: "rabi",
    areaBigha: 3,
    estimatedMaund: 21,
    stockMaund: 0,
    weeklyHarvestMaund: 0,
    status: "ripening",
    harvestDays: 9,
  },
];

const initialMillTruckEntries = [
  {
    id: "mill-truck-sample-1",
    date: "2026-11-18",
    batch: "সপ্তাহের ১ম মিলিং",
    millId: "kader",
    truckNumber: "ঢাকা মেট্রো-ট ১১-৪৫৬৭",
    driverName: "আব্দুল জলিল",
    driverPhone: "01712000001",
    sacks: 80,
    maund: 32,
    kg: 0,
    oilJars: 52,
    oilLiters: 8,
    cakeMaund: 22,
    millFee: 6400,
    truckRent: 3500,
    status: "received",
  },
  {
    id: "mill-truck-sample-2",
    date: "2026-11-18",
    batch: "সপ্তাহের ১ম মিলিং",
    millId: "rafik",
    truckNumber: "কুষ্টিয়া-ট ১১-৮২৩৪",
    driverName: "মো. সেলিম",
    driverPhone: "01712000002",
    sacks: 72,
    maund: 29,
    kg: 20,
    oilJars: 46,
    oilLiters: 12,
    cakeMaund: 20,
    millFee: 5900,
    truckRent: 3200,
    status: "received",
  },
  {
    id: "mill-truck-sample-3",
    date: "2026-11-19",
    batch: "সপ্তাহের ২য় মিলিং",
    millId: "kader",
    truckNumber: "ঢাকা মেট্রো-ট ১১-৭১০২",
    driverName: "রহিম উদ্দিন",
    driverPhone: "01712000003",
    sacks: 60,
    maund: 24,
    kg: 0,
    oilJars: 0,
    oilLiters: 0,
    cakeMaund: 0,
    millFee: 4800,
    truckRent: 3000,
    status: "pending",
  },
];

export const getErpData = async () => {
  const shops = JSON.parse(localStorage.getItem(SHOPS_KEY)) || initialShops;
  const haat = JSON.parse(localStorage.getItem(HAAT_KEY)) || initialHaat;
  const directFarm = JSON.parse(localStorage.getItem(DIRECT_FARM_KEY)) || [];
  const fundValue = localStorage.getItem(FUND_KEY);
  const fund = fundValue === null ? APP_CONFIG.weeklyHaatBudget : Number(fundValue);
  const milling = JSON.parse(localStorage.getItem(MILLING_KEY)) || [];
  const millTruckValue = localStorage.getItem(MILL_TRUCK_KEY);
  const millTruck = millTruckValue === null
    ? initialMillTruckEntries
    : JSON.parse(millTruckValue);
  const farmerBookings = JSON.parse(localStorage.getItem(FARMER_BOOKINGS_KEY)) || [];
  const industrialQuotes = JSON.parse(localStorage.getItem(INDUSTRIAL_QUOTES_KEY)) || [];
  if (millTruckValue === null) {
    localStorage.setItem(MILL_TRUCK_KEY, JSON.stringify(millTruck));
  }
  return { shops, haat, directFarm, fund, milling, millTruck, farmerBookings, industrialQuotes };
};

export const getCropFields = async () => {
  const storedFields = localStorage.getItem(CROP_FIELDS_KEY);
  if (storedFields === null) {
    localStorage.setItem(CROP_FIELDS_KEY, JSON.stringify(initialCropFields));
    return initialCropFields;
  }
  return JSON.parse(storedFields);
};

export const saveCropField = async (field) => {
  const areaBigha = Number(field.areaBigha);
  const estimatedMaund = Number(field.estimatedMaund);
  const stockMaund = Number(field.stockMaund);
  const weeklyHarvestMaund = Number(field.weeklyHarvestMaund);
  if (!Number.isFinite(areaBigha) || areaBigha <= 0 ||
      !Number.isFinite(estimatedMaund) || estimatedMaund < 0 ||
      !Number.isFinite(stockMaund) || stockMaund < 0 ||
      !Number.isFinite(weeklyHarvestMaund) || weeklyHarvestMaund < 0) {
    throw new Error("Crop field values are invalid.");
  }

  const current = await getCropFields();
  const normalizedField = {
    ...field,
    areaBigha,
    estimatedMaund,
    stockMaund,
    weeklyHarvestMaund,
    harvestDays: Number(field.harvestDays) || 0,
  };
  const updated = field.id
    ? current.map((item) => item.id === field.id ? normalizedField : item)
    : [{ ...normalizedField, id: `field-${Date.now()}` }, ...current];
  if (field.id && !current.some((item) => item.id === field.id)) {
    throw new Error("Crop field to update was not found.");
  }
  localStorage.setItem(CROP_FIELDS_KEY, JSON.stringify(updated));
  return updated;
};

export const saveHaatFund = async (amount) => {
  const fund = Number(amount);
  if (!Number.isFinite(fund) || fund < 0) {
    throw new Error("Fund amount must be a non-negative number.");
  }
  localStorage.setItem(FUND_KEY, String(fund));
  return fund;
};

export const addHaatFund = async (amount) => {
  const deposit = Number(amount);
  if (!Number.isFinite(deposit) || deposit <= 0) {
    throw new Error("Fund deposit must be a positive number.");
  }
  const currentValue = localStorage.getItem(FUND_KEY);
  const currentFund = currentValue === null ? APP_CONFIG.weeklyHaatBudget : Number(currentValue);
  const fund = currentFund + deposit;
  localStorage.setItem(FUND_KEY, String(fund));
  return fund;
};

export const saveMillingEntry = async (newEntry) => {
  const current = JSON.parse(localStorage.getItem(MILLING_KEY)) || [];
  const updated = [newEntry, ...current];
  localStorage.setItem(MILLING_KEY, JSON.stringify(updated));
  return updated;
};

export const saveMillTruckEntry = async (newEntry) => {
  const current = JSON.parse(localStorage.getItem(MILL_TRUCK_KEY)) || initialMillTruckEntries;
  const updated = [newEntry, ...current];
  localStorage.setItem(MILL_TRUCK_KEY, JSON.stringify(updated));
  return updated;
};

export const markMillTruckReceived = async (entryId, returnDetails) => {
  const current = JSON.parse(localStorage.getItem(MILL_TRUCK_KEY)) || initialMillTruckEntries;
  const updated = current.map((entry) =>
    entry.id === entryId
      ? { ...entry, ...returnDetails, status: "received" }
      : entry
  );
  localStorage.setItem(MILL_TRUCK_KEY, JSON.stringify(updated));
  return updated;
};

export const saveHaatEntry = async (newEntry) => {
  const current = JSON.parse(localStorage.getItem(HAAT_KEY)) || initialHaat;
  const updated = [newEntry, ...current];
  localStorage.setItem(HAAT_KEY, JSON.stringify(updated));
  return updated;
};

export const saveDirectFarmerEntry = async (newEntry) => {
  const current = JSON.parse(localStorage.getItem(DIRECT_FARM_KEY)) || [];
  const updated = [newEntry, ...current];
  localStorage.setItem(DIRECT_FARM_KEY, JSON.stringify(updated));
  return updated;
};

export const saveFarmerBooking = async (booking) => {
  const estimatedMaund = Number(booking.estimatedMaund);
  if (!booking.farmerName?.trim() || !booking.village?.trim() ||
      !booking.phone?.trim() || !booking.cropId ||
      !Number.isFinite(estimatedMaund) || estimatedMaund <= 0 ||
      !booking.expectedHarvestDate) {
    throw new Error("Farmer booking details are invalid.");
  }
  const current = JSON.parse(localStorage.getItem(FARMER_BOOKINGS_KEY)) || [];
  const saved = {
    ...booking,
    estimatedMaund,
    id: `farmer-booking-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "booking-requested",
  };
  const updated = [saved, ...current];
  localStorage.setItem(FARMER_BOOKINGS_KEY, JSON.stringify(updated));
  return updated;
};

export const saveIndustrialQuote = async (quote) => {
  const totalTons = Number(quote.totalTons);
  const totalMaund = Number(quote.totalMaund);
  if (!quote.productId || !quote.companyName?.trim() ||
      !quote.phone?.trim() || !quote.factoryLocation?.trim() ||
      !Number.isFinite(totalTons) || totalTons <= 0 ||
      !Number.isFinite(totalMaund) || totalMaund <= 0) {
    throw new Error("Industrial quote details are invalid.");
  }
  const current = JSON.parse(localStorage.getItem(INDUSTRIAL_QUOTES_KEY)) || [];
  const saved = {
    ...quote,
    id: `industrial-quote-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "quote-requested",
  };
  const updated = [saved, ...current];
  localStorage.setItem(INDUSTRIAL_QUOTES_KEY, JSON.stringify(updated));
  return updated;
};

export const updateIndustrialShipment = async (quoteId, shipment) => {
  const allowedStatuses = ["quote-requested", "confirmed", "dispatched", "delivered"];
  const netTons = Number(shipment.netTons);
  const moisturePercent = shipment.moisturePercent === "" || shipment.moisturePercent === null
    ? null
    : Number(shipment.moisturePercent);
  if (!quoteId || !allowedStatuses.includes(shipment.status) ||
      (shipment.netTons !== "" && (!Number.isFinite(netTons) || netTons < 0)) ||
      (moisturePercent !== null && (!Number.isFinite(moisturePercent) || moisturePercent < 0 || moisturePercent > 100))) {
    throw new Error("Industrial shipment details are invalid.");
  }
  const current = JSON.parse(localStorage.getItem(INDUSTRIAL_QUOTES_KEY)) || [];
  if (!current.some((quote) => quote.id === quoteId)) {
    throw new Error("Industrial quote to update was not found.");
  }
  const updated = current.map((quote) => quote.id === quoteId
    ? {
        ...quote,
        shipment: {
          ...shipment,
          netTons: shipment.netTons === "" ? "" : netTons,
          moisturePercent,
          updatedAt: new Date().toISOString(),
        },
        status: shipment.status,
      }
    : quote);
  localStorage.setItem(INDUSTRIAL_QUOTES_KEY, JSON.stringify(updated));
  return updated;
};

export const updateShopLedger = async ({ shopId, liters, bill, paid }) => {
  const current = JSON.parse(localStorage.getItem(SHOPS_KEY)) || initialShops;
  const updated = current.map((s) =>
    s.id === Number(shopId)
      ? {
          ...s,
          liters: s.liters + Number(liters),
          totalBill: s.totalBill + Number(bill),
          paid: s.paid + Number(paid),
          due: s.due + (Number(bill) - Number(paid)),
        }
      : s
  );
  localStorage.setItem(SHOPS_KEY, JSON.stringify(updated));
  return updated;
};