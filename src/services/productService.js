import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";

export const fetchProducts = async ({ category = "all", search = "" }) => {
  await new Promise((res) => setTimeout(res, 150)); // API সিমুলেশন
  return productsData.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
};

export const fetchCategories = async () => categoriesData;