import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";
import { ROUTES } from "../../constants/routePaths";

export default function NotFound() {
  return (
    <main className="flex min-h-[55vh] w-full items-center justify-center bg-[#FAF7F2] px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-lg sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-emerald-800">
          <SearchX className="h-8 w-8" />
        </span>
        <p className="mt-5 text-sm font-extrabold tracking-widest text-amber-700">৪০৪ • পৃষ্ঠা খুঁজে পাওয়া যায়নি</p>
        <h1 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">এই পথটি বাজারে নেই</h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          ঠিকানাটি ভুল হতে পারে, অথবা পৃষ্ঠাটি সরানো হয়েছে। হোম পেজ থেকে বাজার ও পণ্য দেখুন।
        </p>
        <Link
          to={ROUTES.HOME}
          className="btn mt-7 border-none bg-emerald-800 px-6 text-base font-bold text-white hover:bg-emerald-900"
        >
          <ArrowLeft className="h-5 w-5" />
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}