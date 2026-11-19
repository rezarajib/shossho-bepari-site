export const SUPPLY_MODEL_FILTERS = [
  {
    id: "farmer",
    label: "সরাসরি কৃষক থেকে (C-B / C-B-B)",
    shortLabel: "সরাসরি কৃষক থেকে",
    codes: ["C-B", "C-B-B"],
  },
  {
    id: "mill",
    label: "নিজস্ব মিল (B-C)",
    shortLabel: "নিজস্ব মিল",
    codes: ["B-C"],
  },
  {
    id: "wholesale",
    label: "পাইকারি B2B (B-B / B-B-C)",
    shortLabel: "পাইকারি B2B",
    codes: ["B-B", "B-B-C"],
  },
];

export const getSupplyModelFilter = (product) =>
  SUPPLY_MODEL_FILTERS.find((filter) => filter.codes.includes(product.businessModel))?.id ?? "wholesale";

export const matchesSupplyModel = (product, filterId) =>
  filterId === "all" || getSupplyModelFilter(product) === filterId;
