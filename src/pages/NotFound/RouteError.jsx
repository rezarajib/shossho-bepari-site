import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { ROUTES } from "../../constants/routePaths";

export default function RouteError() {
  const error = useRouteError();
  const isMissingRoute = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#FAF7F2] px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-lg sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
          <TriangleAlert className="h-8 w-8" />
        </span>
        <p className="mt-5 text-sm font-extrabold tracking-widest text-amber-700">
          {isMissingRoute ? "৪০৪ • পৃষ্ঠা খুঁজে পাওয়া যায়নি" : "পৃষ্ঠা লোড করা যায়নি"}
        </p>
        <h1 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">
          {isMissingRoute ? "এই পথটি বাজারে নেই" : "দুঃখিত, সাময়িক সমস্যা হয়েছে"}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          {isMissingRoute
            ? "ঠিকানাটি ভুল হতে পারে, অথবা পৃষ্ঠাটি সরানো হয়েছে।"
            : "পৃষ্ঠাটি এখন দেখানো যাচ্ছে না। হোম পেজে ফিরে গিয়ে আবার চেষ্টা করুন।"}
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
