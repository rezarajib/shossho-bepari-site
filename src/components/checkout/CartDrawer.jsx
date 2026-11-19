import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { APP_CONFIG } from "../../constants/appConfig";
import { useCart } from "../../hooks/useCart";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";
import { formatQuantityBreakdown } from "../../utils/unitConverter";
import { sendOrderToWhatsApp } from "../../utils/whatsappFormatter";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
}[character]));

export default function CartDrawer() {
  const { cart, updateQty, removeFromCart, totalAmount, totalWeightKg, totalLiters, totalWeightMaund, isDrawerOpen, setIsDrawerOpen } = useCart();
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    type: "সাধারণ ক্রেতা",
    address: "",
  });

  if (!isDrawerOpen) return null;

  const inputClass = "input input-bordered min-h-0 w-full rounded-xl border-stone-300 bg-white px-4 py-3.5 text-base text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-emerald-700 lg:text-lg";
  const labelClass = "block space-y-1.5 text-sm font-bold text-stone-700 lg:text-base";

  const printCashMemo = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.alert("ক্যাশ মেমো খোলা যায়নি। ব্রাউজারে পপ-আপ অনুমতি দিয়ে আবার চেষ্টা করুন।");
      return;
    }

    const memoNumber = `SB-${Date.now().toString().slice(-8)}`;
    const date = new Intl.DateTimeFormat("bn-BD", { dateStyle: "long", timeStyle: "short" }).format(new Date());
    const itemRows = cart.map((item, index) => `
      <tr>
        <td>${toBanglaNum(index + 1)}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(formatQuantityBreakdown(item))}</td>
        <td class="amount">${escapeHtml(formatTaka(item.calculatedTotal))}</td>
      </tr>
    `).join("");
    const maund = Math.floor(totalWeightKg / 40);
    const remainingKg = Number((totalWeightKg % 40).toFixed(2));
    const weightSummary = totalWeightKg > 0
      ? `${toBanglaNum(maund)} মণ${remainingKg > 0 ? ` ${toBanglaNum(remainingKg)} কেজি` : ""} (${toBanglaNum(Number(totalWeightKg.toFixed(2)))} কেজি)`
      : "প্রযোজ্য নয়";

    printWindow.document.write(`<!doctype html>
      <html lang="bn">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${escapeHtml(APP_CONFIG.brandName)} • ডিজিটাল ক্যাশ মেমো</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 32px; color: #1c1917; font: 16px/1.6 system-ui, sans-serif; }
            .memo { max-width: 850px; margin: auto; border: 2px solid #064e3b; border-radius: 18px; overflow: hidden; }
            header { padding: 28px 32px; background: #064e3b; color: #fff; }
            h1 { margin: 0; color: #fcd34d; font-size: 30px; }
            header p { margin: 4px 0 0; color: #ecfdf5; }
            main { padding: 24px 32px 32px; }
            .meta, .buyer { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 24px; margin-bottom: 20px; }
            .buyer { padding: 16px; border-radius: 12px; background: #faf7f2; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 11px 9px; border-bottom: 1px solid #e7e5e4; text-align: left; vertical-align: top; }
            th { background: #f3efe6; color: #064e3b; }
            .amount { text-align: right; white-space: nowrap; font-weight: 700; }
            .totals { margin: 18px 0; padding: 16px; border-radius: 12px; background: #ecfdf5; }
            .total { display: flex; justify-content: space-between; gap: 12px; font-size: 22px; font-weight: 900; color: #064e3b; }
            .note { padding-top: 16px; border-top: 1px solid #d6d3d1; color: #57534e; font-size: 13px; }
            .signatures { display: flex; justify-content: space-between; gap: 40px; margin-top: 56px; }
            .signatures span { width: 42%; padding-top: 8px; border-top: 1px solid #78716c; text-align: center; }
            @media print { body { padding: 0; } .memo { border-radius: 0; } }
            @media (max-width: 600px) { body { padding: 12px; } main { padding: 18px 14px; } header { padding: 20px 16px; } .meta, .buyer { grid-template-columns: 1fr; } table { font-size: 13px; } }
          </style>
        </head>
        <body>
          <article class="memo">
            <header><h1>🌾 ${escapeHtml(APP_CONFIG.brandName)}</h1><p>${escapeHtml(APP_CONFIG.tagline)}</p><p>মোবাইল: +${escapeHtml(APP_CONFIG.whatsappNumber)}</p></header>
            <main>
              <h2>ডিজিটাল ক্যাশ মেমো / অর্ডার চালান</h2>
              <div class="meta"><span><strong>মেমো নম্বর:</strong> ${escapeHtml(memoNumber)}</span><span><strong>তারিখ:</strong> ${escapeHtml(date)}</span></div>
              <section class="buyer">
                <span><strong>ক্রেতার নাম:</strong> ${escapeHtml(customer.name || "উল্লেখ করা হয়নি")}</span>
                <span><strong>ক্রেতার ধরন:</strong> ${escapeHtml(customer.type)}</span>
                <span><strong>মোবাইল:</strong> ${escapeHtml(customer.phone || "উল্লেখ করা হয়নি")}</span>
                <span><strong>ডেলিভারি ঠিকানা:</strong> ${escapeHtml(customer.address || "উল্লেখ করা হয়নি")}</span>
              </section>
              <table>
                <thead><tr><th>ক্রম</th><th>পণ্য</th><th>পরিমাণ ও একক</th><th class="amount">মোট</th></tr></thead>
                <tbody>${itemRows}</tbody>
              </table>
              <section class="totals">
                <p><strong>মোট ওজন:</strong> ${escapeHtml(weightSummary)}</p>
                ${totalLiters > 0 ? `<p><strong>মোট তরল:</strong> ${escapeHtml(toBanglaNum(Number(totalLiters.toFixed(2))))} লিটার</p>` : ""}
                <p class="total"><span>সর্বমোট বিল</span><span>${escapeHtml(formatTaka(totalAmount))}</span></p>
              </section>
              <p class="note">ওজনের মান: ১ মণ = ৪০ কেজি। এটি অর্ডার চালানের কপি; বিক্রেতার মাধ্যমে অর্ডার ও অর্থপ্রাপ্তি নিশ্চিত হলে চূড়ান্ত রসিদ প্রযোজ্য হবে।</p>
              <div class="signatures"><span>ক্রেতার স্বাক্ষর</span><span>${escapeHtml(APP_CONFIG.brandName)} — অনুমোদিত স্বাক্ষর</span></div>
            </main>
          </article>
          <script>window.addEventListener("load", () => window.setTimeout(() => window.print(), 250));</script>
        </body>
      </html>`);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setIsDrawerOpen(false)}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="cart-drawer-panel flex h-full w-full flex-col border-l border-stone-200 bg-[#FAF7F2] text-stone-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-white/80 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <h2 id="cart-drawer-title" className="text-xl font-black text-stone-900 lg:text-2xl">আপনার অর্ডার ব্যাগ</h2>
              <p className="text-sm font-medium text-stone-600">{toBanglaNum(cart.length)}টি পণ্য</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            whileTap={{ scale: 0.96 }}
            aria-label="কার্ট বন্ধ করুন"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition hover:bg-stone-200 hover:text-stone-900"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-stone-400 shadow-sm">
                <ShoppingBag className="h-8 w-8" />
              </span>
              <p className="text-lg font-bold text-stone-800">আপনার ব্যাগ খালি আছে</p>
              <p className="mt-1 text-sm text-stone-500">পণ্য বেছে নিয়ে অর্ডার ব্যাগে যোগ করুন।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <article key={item.key} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-xl font-black leading-snug text-stone-900">{item.name}</h3>
                    <motion.button
                      type="button"
                      onClick={() => removeFromCart(item.key)}
                      whileTap={{ scale: 0.92 }}
                      aria-label={`${item.name} কার্ট থেকে সরান`}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-base font-bold text-emerald-950">
                      {formatQuantityBreakdown(item)}
                    </span>
                    <span className={`rounded-xl px-3 py-1.5 text-sm font-bold ${item.appliedRateType === "wholesale" ? "bg-amber-100 text-amber-950" : "bg-stone-100 text-stone-700"}`}>
                      {item.appliedRateType === "wholesale" ? "পূর্ণ মণ/জার পাইকারি, বাকি খুচরা দর" : `খুচরা দর • প্রতি ১ ${item.unitType === "weight" ? "কেজি" : "লিটার"} ${formatTaka(item.retailPrice)}`}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    <div className="flex items-center gap-3">
                      <motion.button
                        type="button"
                        onClick={() => updateQty(item.key, -1)}
                        whileTap={{ scale: 0.94 }}
                        aria-label={`${item.name} ১ ${item.unitType === "weight" ? "কেজি" : "লিটার"} কমান`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800 transition hover:bg-emerald-100 hover:text-emerald-900"
                      >
                        <Minus className="h-4 w-4" />
                      </motion.button>
                      <span className="min-w-28 text-center text-lg font-extrabold text-stone-900">
                        {toBanglaNum(item.quantity)} {item.unitType === "weight" ? "কেজি" : "লিটার"}
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => updateQty(item.key, 1)}
                        whileTap={{ scale: 0.94 }}
                        aria-label={`${item.name} ১ ${item.unitType === "weight" ? "কেজি" : "লিটার"} বাড়ান`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800 transition hover:bg-emerald-100 hover:text-emerald-900"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <p className="text-xl font-black text-emerald-900">{formatTaka(item.calculatedTotal)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="shrink-0 space-y-3 border-t border-stone-200 bg-white/90 px-4 py-4 shadow-[0_-8px_24px_rgba(28,25,23,0.06)] sm:px-6 sm:py-5">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FAF7F2] px-4 py-3 text-sm font-bold text-stone-700 lg:text-base">
              <span>মোট ওজন / পরিমাণ</span>
              <span className="text-right text-stone-900">
                {totalWeightKg > 0 && <span>মোট ওজন: {toBanglaNum(Math.floor(totalWeightMaund))} মণ{totalWeightKg % 40 > 0 ? ` ${toBanglaNum(Number((totalWeightKg % 40).toFixed(2)))} কেজি` : ""} ({toBanglaNum(Number(totalWeightKg.toFixed(2)))} কেজি)</span>}
                {totalWeightKg > 0 && totalLiters > 0 && <span className="mx-1 text-stone-400">•</span>}
                {totalLiters > 0 && <span>{`মোট তরল: ${toBanglaNum(Number(totalLiters.toFixed(2)))} লিটার`}</span>}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg font-extrabold text-stone-900 lg:text-xl">
              <span>সর্বমোট বিল</span>
              <span className="text-2xl font-black text-emerald-900">{formatTaka(totalAmount)}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                আপনার নাম
                <input className={inputClass} placeholder="আপনার পূর্ণ নাম" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
              </label>
              <label className={labelClass}>
                মোবাইল নম্বর
                <input className={inputClass} type="tel" inputMode="tel" placeholder="০১XXXXXXXXX" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
              </label>
            </div>
            <label className={labelClass}>
              ক্রেতার ধরন
              <select className="select select-bordered min-h-0 w-full rounded-xl border-stone-300 bg-white px-4 py-3.5 text-base text-stone-900 lg:text-lg" value={customer.type} onChange={(event) => setCustomer({ ...customer, type: event.target.value })}>
                <option>সাধারণ ক্রেতা</option>
                <option>গবাদিপশুর খামারি</option>
                <option>পাইকারি দোকানদার</option>
                <option>সরকারি অফিস (বীজ)</option>
              </select>
            </label>
            <label className={labelClass}>
              ডেলিভারি ঠিকানা
              <input className={inputClass} placeholder="গ্রাম / বাজার / উপজেলা" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => sendOrderToWhatsApp(customer, cart, totalAmount)}
                className="btn min-h-14 w-full rounded-2xl border-none bg-emerald-800 py-4 text-base font-black text-white shadow-lg shadow-emerald-950/15 hover:bg-emerald-900 lg:text-lg"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp-এ অর্ডার কনফার্ম করুন
              </button>
              <button
                type="button"
                onClick={printCashMemo}
                className="btn min-h-14 w-full rounded-2xl border-2 border-amber-400 bg-amber-100 py-4 text-base font-black text-amber-950 hover:bg-amber-200 lg:text-lg"
              >
                <FileText className="h-5 w-5" />
                🧾 ডিজিটাল ক্যাশ মেমো প্রিন্ট / সেভ করুন
              </button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
