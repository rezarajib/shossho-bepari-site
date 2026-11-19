import { APP_CONFIG } from "../constants/appConfig";
import { toBanglaNum } from "./formatBanglaNumber";

const MAUND_KG = APP_CONFIG.maundToKg || 40; // ১ মণ = ৪০ কেজি
const TON_KG = 1000; // ১ টন = ১০০০ কেজি (২৫ মণ)

/**
 * কেজি থেকে মণ রূপান্তর (উদাহরণ: 80 কেজি -> 2 মণ)
 */
export const kgToMaund = (kg) => {
  if (!kg || kg <= 0) return 0;
  return Number((kg / MAUND_KG).toFixed(2));
};

/**
 * মণ থেকে কেজি রূপান্তর (উদাহরণ: 2 মণ -> 80 কেজি)
 */
export const maundToKg = (maund) => {
  if (!maund || maund <= 0) return 0;
  return Number((maund * MAUND_KG).toFixed(2));
};

/**
 * কেজি থেকে টন রূপান্তর (খামারিদের ২+ টন গোখাদ্য হিসাবের জন্য)
 */
export const kgToTon = (kg) => {
  if (!kg || kg <= 0) return 0;
  return Number((kg / TON_KG).toFixed(3));
};

/**
 * মণ থেকে টন রূপান্তর (২৫ মণ = ১ টন)
 */
export const maundToTon = (maund) => {
  if (!maund || maund <= 0) return 0;
  return Number(((maund * MAUND_KG) / TON_KG).toFixed(2));
};

const roundQuantity = (value) => Number((Number(value) || 0).toFixed(2));

const getPackageSize = (product) =>
  Number(product.wholesalePackageSize || product.jarSize || product.maundToKg || product.maundToLiters || MAUND_KG);

const formatPackageQuantity = (product, packageCount, remainder, total) => {
  const count = toBanglaNum(packageCount);
  const extra = roundQuantity(remainder);
  const totalLabel = toBanglaNum(roundQuantity(total));

  if (product.unitType === "weight") {
    const extraLabel = extra ? ` ${toBanglaNum(extra)} কেজি` : "";
    return packageCount
      ? `${count} মণ${extraLabel} (${totalLabel} কেজি)`
      : `${totalLabel} কেজি`;
  }

  if (product.maundToLiters) {
    const extraLabel = extra ? ` ${toBanglaNum(extra)} লিটার` : "";
    return packageCount
      ? `${count} মণ${extraLabel} (${totalLabel} লিটার)`
      : `${totalLabel} লিটার`;
  }

  const extraLabel = extra ? ` ${toBanglaNum(extra)} লিটার` : "";
  return packageCount
    ? `${count} জার${extraLabel} (${totalLabel} লিটার)`
    : `${totalLabel} লিটার`;
};

const createBillBreakdown = (product, quantity) => {
  const packageSize = getPackageSize(product);
  const totalQuantity = roundQuantity(quantity);
  const maund = product.unitType === "weight" || product.maundToLiters
    ? Math.floor(totalQuantity / packageSize)
    : 0;
  const jars = product.jarSize ? Math.floor(totalQuantity / packageSize) : 0;
  const packageCount = maund || jars;
  const remainder = roundQuantity(totalQuantity - packageCount * packageSize);
  const retailRemainderPrice = product.retailPrice * remainder;
  const calculatedTotal = Math.round(
    packageCount * product.wholesalePrice + retailRemainderPrice
  );
  const isWholesale = packageCount > 0;

  return {
    maund,
    kg: product.unitType === "weight" ? remainder : 0,
    liters: product.unitType === "volume" ? remainder : 0,
    jars,
    quantity: totalQuantity,
    packageSize,
    packageCount,
    unitLabel: formatPackageQuantity(product, packageCount, remainder, totalQuantity),
    appliedRateType: isWholesale ? "wholesale" : "retail",
    calculatedTotal,
  };
};

export const calculateSmartBill = (product, quantity) => {
  if (!product || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
    return createBillBreakdown(product ?? {}, 0);
  }

  return createBillBreakdown(product, Number(quantity));
};

export const calculateBillFromUnits = (product, { maund = 0, kg = 0, liters = 0, jars = 0 } = {}) => {
  const totalQuantity = product.unitType === "weight"
    ? Number(maund || 0) * Number(product.maundToKg || MAUND_KG) + Number(kg || 0)
    : Number(jars || 0) * Number(product.jarSize || getPackageSize(product)) + Number(liters || 0);

  return calculateSmartBill(product, totalQuantity);
};

export const calculateQuantityForBudget = (product, budget) => {
  if (!product || !product.retailPrice) {
    return calculateSmartBill(product, 0);
  }

  const availableBudget = Math.max(0, Number(budget) || 0);
  const packageSize = getPackageSize(product);
  const retailPackagePrice = packageSize * product.retailPrice;

  if (!packageSize) {
    return calculateSmartBill(product, 0);
  }

  if (product.wholesalePrice >= retailPackagePrice) {
    return calculateSmartBill(product, availableBudget / product.retailPrice);
  }

  const packageCount = Math.floor(availableBudget / product.wholesalePrice);
  const remainingBudget = availableBudget - packageCount * product.wholesalePrice;
  const remainder = Math.floor((remainingBudget / product.retailPrice) * 100) / 100;

  return calculateSmartBill(product, packageCount * packageSize + remainder);
};

export const formatQuantityBreakdown = (item) => {
  if (item?.unitLabel) return item.unitLabel;
  if (item?.unitType === "weight") {
    return formatPackageQuantity(
      { unitType: "weight" },
      Number(item.maund || 0),
      Number(item.kg || 0),
      Number(item.quantity || 0)
    );
  }
  return `${toBanglaNum(item?.quantity || item?.liters || 0)} ${item?.retailUnit || "লিটার"}`;
};

/**
 * মোট কেজিকে মানুষের পড়ার উপযোগী বাংলা এককে রূপান্তর
 * উদাহরণ: 100 কেজি -> "২ মণ ২০ কেজি"
 */
export const formatWeightBangla = (totalKg) => {
  if (!totalKg || totalKg <= 0) return "০ কেজি";

  if (totalKg >= TON_KG) {
    const tons = kgToTon(totalKg);
    return `${toBanglaNum(tons)} টন (${toBanglaNum(kgToMaund(totalKg))} মণ)`;
  }

  const maunds = Math.floor(totalKg / MAUND_KG);
  const remainingKg = Number((totalKg % MAUND_KG).toFixed(2));

  if (maunds > 0 && remainingKg > 0) {
    return `${toBanglaNum(maunds)} মণ ${toBanglaNum(remainingKg)} কেজি`;
  }
  if (maunds > 0) {
    return `${toBanglaNum(maunds)} মণ`;
  }
  return `${toBanglaNum(remainingKg)} কেজি`;
};

/**
 * খুচরা ও পাইকারি দরের মধ্যে সাশ্রয় (Savings) হিসাব করা
 */
export const calculateWholesaleSavings = (retailPricePerUnit, wholesalePrice, multiplier = MAUND_KG) => {
  const regularTotal = retailPricePerUnit * multiplier;
  const savings = regularTotal - wholesalePrice;
  return savings > 0 ? savings : 0;
};