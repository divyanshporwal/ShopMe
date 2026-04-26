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