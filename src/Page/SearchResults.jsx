import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);

      try {
        const res = await API.get(
          `/products/?search=${query}`
        );

        setResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return <p className="pt-32 text-center">Searching...</p>;
  }

  return (
    <div className="pt-28 px-6">
      <h2 className="text-xl mb-6">
        Search results for "<b>{query}</b>"
      </h2>

      {results.length === 0 && (
        <p className="text-gray-500">No products found</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {results.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              navigate(`/product/${item.categoryName}/${item.id}`)
            }
            className="cursor-pointer group flex flex-col"
          >
            <div className="w-full h-65 md:h-80 overflow-hidden bg-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex flex-col grow mt-2">
              <p className="text-sm font-medium leading-tight line-clamp-2">
                {item.name}
              </p>

              <p className="text-sm text-gray-600 mt-auto">
                ₹{item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;