export const fetcher = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include", // 🔥 important
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.json();
};

export const getProducts = async () => {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    return data.products?.length ? data.products : mockProducts;
  } catch {
    return mockProducts;
  }
};