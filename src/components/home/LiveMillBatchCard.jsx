import { Factory, PackageCheck, Wheat } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import products from "../../data/products.json";
import { getErpData } from "../../services/erpService";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";

const mills = [
  { id: "kader", name: "কাদের আলী মিল" },
  { id: "rafik", name: "রফিক মিয়া মিল" },
];

function getOilLiters(entry) {
  return Number(entry.oilJars || 0) * 20 + Number(entry.oilLiters || 0);
}

function getLatestReceived(entries, millId) {
  return entries
    .filter((entry) => entry.millId === millId && entry.status === "received")
    .sort((first, second) => new Date(second.date) - new Date(first.date))[0];
}

export default function LiveMillBatchCard({ onOrder }) {
  const { data, isLoading, isError } = useQuery({ queryKey: ["erpData"], queryFn: getErpData });
  const oilProduct = products.find((product) => product.id === "mustard-oil");
  const stockLabel = oilProduct?.stock ?? "স্টক তথ্য নেই";
  const oilRate = oilProduct?.retailPrice;

  return (
    <section className="w-full px-4 py-6 sm:px-8 lg:px-12 xl:px-16" aria-labelledby="live-mill-batch-title">
      <div className="overflow-hidden rounded-3xl border-2 border-emerald-900/15 bg-linear-to-br from-[#FAF7F2] via-white to-[#F3EFE6] shadow-md">
        <div className="flex flex-col gap-4 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-800 text-amber-300 shadow-sm">
              <Factory className="h-6 w-6" />
            </span>
            <div>
              <p className="text-base font-extrabold uppercase tracking-wide text-emerald-800 lg:text-lg">মিলের সর্বশেষ আপডেট</p>
              <h2 id="live-mill-batch-title" className="text-2xl font-black text-stone-900 sm:text-3xl lg:text-4xl">🏭 সরাসরি মিলিং লাইভ স্ট্যাটাস</h2>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-5 py-2.5 text-base font-black text-amber-950 lg:text-lg">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-600" />
            {isLoading ? "মিলের তথ্য লোড হচ্ছে" : isError ? "তথ্য সাময়িকভাবে পাওয়া যাচ্ছে না" : `সরিষার তেলের ক্যাটালগ মজুত: ${stockLabel}`}
          </span>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:p-8">
          {mills.map((mill) => {
            const latest = getLatestReceived(data?.millTruck ?? [], mill.id);
            return (
              <article key={mill.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-black text-stone-900 lg:text-3xl">{mill.name}</h3>
                  {latest && <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-extrabold text-emerald-900 lg:text-base">{latest.batch}</span>}
                </div>
                {isError ? (
                  <p role="alert" className="mt-3 text-base font-semibold text-red-700">মিলের ব্যাচ তথ্য লোড করা যায়নি। পরে আবার চেষ্টা করুন।</p>
                ) : latest ? (
                  <>
                    <p className="mt-1 text-base font-bold text-stone-700 lg:text-lg">
                      ব্যাচ আপডেট • {new Intl.DateTimeFormat("bn-BD", { dateStyle: "long" }).format(new Date(`${latest.date}T12:00:00`))}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#FAF7F2] p-4">
                        <p className="mb-1 flex items-center gap-1.5 text-base font-extrabold text-stone-600 lg:text-lg"><PackageCheck className="h-5 w-5 shrink-0 text-emerald-800" /> তেল বুঝে পাওয়া</p>
                        <p className="mt-1 text-2xl font-black text-emerald-900 sm:text-3xl lg:text-4xl">{toBanglaNum(getOilLiters(latest))} লিটার</p>
                      </div>
                      <div className="rounded-xl bg-[#FAF7F2] p-4">
                        <p className="mb-1 flex items-center gap-1.5 text-base font-extrabold text-stone-600 lg:text-lg"><Wheat className="h-5 w-5 shrink-0 text-amber-800" /> খৈল বুঝে পাওয়া</p>
                        <p className="mt-1 text-2xl font-black text-stone-900 sm:text-3xl lg:text-4xl">{toBanglaNum(Number(latest.cakeMaund || 0))} মণ</p>
                      </div>
                    </div>
                    <p className="mt-3 text-base font-bold text-stone-700 lg:text-lg">
                      {latest.truckNumber} • {latest.status === "received" ? "তেল ও খৈল বুঝে পাওয়া সম্পন্ন" : "মিলে ভাঙানো চলছে"}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-base font-semibold text-stone-600">এই মিলের কোনো সম্পন্ন ব্যাচ এখনো লেজারে নেই।</p>
                )}
              </article>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-200 bg-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-8">
          <p className="text-base font-bold text-stone-800 lg:text-lg">
            {oilRate ? `বর্তমান ক্যাটালগ দর: ${formatTaka(oilRate)} / লিটার • ব্যাচ ও স্টক ERP রেকর্ড থেকে` : "ব্যাচের তথ্য মালিকের ERP লেজার থেকে"}
          </p>
          <button type="button" onClick={onOrder} className="btn min-h-14 rounded-2xl border-none bg-emerald-800 px-7 py-3.5 text-lg font-black text-white shadow-md hover:bg-emerald-900 lg:text-xl">
            তাজা ব্যাচ অর্ডার করুন
          </button>
        </div>
      </div>
    </section>
  );
}
