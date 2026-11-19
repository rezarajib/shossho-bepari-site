/**
 * ১. সাপ্তাহিক হাটের কেনাকাটার এন্ট্রি যাচাই (Haat Purchase Validation)
 * @param {Object} entry - { item, maund, ratePerMaund, date }
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateHaatEntry = (entry) => {
  const errors = {};

  if (!entry?.item || entry.item.trim().length < 2) {
    errors.item = "দয়া করে শস্য বা পণ্যের সঠিক নাম লিখুন (যেমন: দেশি সরিষা, তিল, গম)।";
  }

  const maund = Number(entry?.maund);
  if (!maund || maund <= 0 || maund > 500) {
    errors.maund = "পরিমাণ ০ মণের বেশি এবং ৫০০ মণের মধ্যে হতে হবে।";
  }

  const rate = Number(entry?.ratePerMaund);
  if (!rate || rate < 100 || rate > 50000) {
    errors.ratePerMaund = "প্রতি মণের সঠিক দর (৳) লিখুন।";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * ২. ৭ নিয়মিত দোকানে সরিষার তেল ডেলিভারি ও জমা-বাকি এন্ট্রি যাচাই
 * (হাবিল, সাহেবআলী, সর্বেশ, সোনামিয়া, সোবেদআলী, আয়বুল্লা, কামরুল)
 * @param {Object} delivery - { shopId, liters, bill, paid }
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateShopDelivery = (delivery) => {
  const errors = {};

  if (!delivery?.shopId) {
    errors.shopId = "দয়া করে তালিকা থেকে একটি দোকান নির্বাচন করুন।";
  }

  const liters = Number(delivery?.liters);
  if (liters < 0 || liters > 2000) {
    errors.liters = "সরিষার তেলের সঠিক পরিমাণ (লিটার) লিখুন।";
  }

  const bill = Number(delivery?.bill);
  if (bill < 0) {
    errors.bill = "মোট বিলের পরিমাণ ঋণাত্মক হতে পারবে না।";
  }

  const paid = Number(delivery?.paid);
  if (paid < 0) {
    errors.paid = "নগদ জমার পরিমাণ ঋণাত্মক হতে পারবে না।";
  }

  // শুধু বকেয়া টাকা পরিশোধের ক্ষেত্রে liters ও bill ০ হতে পারে, তাই উভয়ই ০ হলে আটকানো হবে
  if (liters === 0 && bill === 0 && paid === 0) {
    errors.general = "অন্তত তেলের পরিমাণ অথবা নগদ জমার টাকা লিখুন।";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * প্রাথমিক ডিফল্ট ফর্ম স্টেটসমূহ
 */
export const initialHaatEntryState = {
  date: "আজকের হাট",
  item: "দেশি মাঘী সরিষা",
  maund: "",
  ratePerMaund: "",
};

export const initialShopDeliveryState = {
  shopId: 1,
  liters: 40,
  bill: 9800,
  paid: 9800,
};