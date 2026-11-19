const VALID_CUSTOMER_TYPES = [
  "সাধারণ ক্রেতা",
  "গবাদিপশুর খামারি",
  "পাইকারি দোকানদার",
  "সরকারি অফিস (বীজ)",
];

// বাংলাদেশি মোবাইল নম্বর যাচাই (013 - 019 দিয়ে শুরু ১১ ডিজিট, অথবা +880 সহ)
const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

/**
 * অর্ডার কনফার্ম করার আগে ক্রেতার তথ্য এবং কার্ট যাচাই করে
 * @param {Object} customer - { name, phone, type, address, note }
 * @param {Array} cartItems - কার্টে থাকা পণ্যের তালিকা
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateCheckout = (customer, cartItems = []) => {
  const errors = {};

  // ১. কার্ট খালি কি না যাচাই
  if (!cartItems || cartItems.length === 0) {
    errors.cart = "অর্ডার করার জন্য অন্তত একটি পণ্য ব্যাগে যোগ করুন।";
  }

  // ২. ক্রেতার নাম যাচাই
  if (!customer?.name || customer.name.trim().length < 2) {
    errors.name = "দয়া করে ক্রেতা বা প্রতিষ্ঠানের সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)।";
  }

  // ৩. মোবাইল নম্বর যাচাই
  const cleanPhone = (customer?.phone || "").replace(/[\s-]/g, "");
  if (!cleanPhone) {
    errors.phone = "যোগাযোগের জন্য মোবাইল নম্বর আবশ্যক।";
  } else if (!BD_PHONE_REGEX.test(cleanPhone)) {
    errors.phone = "সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।";
  }

  // ৪. ক্রেতার ধরন যাচাই
  if (!customer?.type || !VALID_CUSTOMER_TYPES.includes(customer.type)) {
    errors.type = "সঠিক ক্রেতার ধরন নির্বাচন করুন।";
  }

  // ৫. ডেলিভারি ঠিকানা যাচাই
  if (!customer?.address || customer.address.trim().length < 5) {
    errors.address = "সঠিক ডেলিভারি ঠিকানা বা বাজারের নাম লিখুন।";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * চেকআউট ফর্মের প্রাথমিক ডিফল্ট স্টেট
 */
export const initialCheckoutState = {
  name: "",
  phone: "",
  type: "সাধারণ ক্রেতা",
  address: "",
  note: "",
};