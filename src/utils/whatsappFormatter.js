import { APP_CONFIG } from "../constants/appConfig";
import { formatTaka, toBanglaNum } from "./formatBanglaNumber";

export const sendOrderToWhatsApp = (customer, items, total) => {
  const itemLines = items
    .map(
      (item, i) =>
        `${toBanglaNum(i + 1)}. ${item.name} — ${item.unitLabel || `${toBanglaNum(item.quantity)} ${item.unitType === "weight" ? "কেজি" : "লিটার"}`} = ${formatTaka(item.calculatedTotal ?? item.price * item.qty)}`
    )
    .join("\n");

  const text = `*🌾 ${APP_CONFIG.brandName} - নতুন অর্ডার*\n` +
    `ক্রেতা: ${customer.name} (${customer.type})\n` +
    `মোবাইল: ${customer.phone}\n` +
    `ঠিকানা: ${customer.address}\n` +
    `------------------------\n${itemLines}\n` +
    `------------------------\n*মোট বিল: ${formatTaka(total)}*`;

  window.open(
    `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`,
    "_blank"
  );
};