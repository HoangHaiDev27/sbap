import { useState, useEffect } from "react";
import { API_ENDPOINTS, getFullApiUrl } from "../config/apiConfig";

// debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 500); // 0.5s debounce

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    let cancel = false;
    setLoading(true);
    setError(null);
    const url = API_ENDPOINTS.BOOK_SEARCH(debouncedQuery);
    fetch(url)
      .then((res) => {
        console.log("Phản hồi HTTP:", res);
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((data) => {
        console.log("Phản hồi API:", data);
        if (!cancel) setResults(data);
      })
      .catch((err) => {
        console.log("Lỗi:", err);
        if (!cancel) setError(err.message);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });

    return () => {
      cancel = true;
    };
  }, [debouncedQuery]);

  return { query, setQuery, results, loading, error };
}
