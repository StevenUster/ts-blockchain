import { useEffect, useState } from "react";

const useSQL = (query: string): any => {
  const [result, setResult] = useState<string>("no result");

  useEffect(() => {
    fetch(`https://projekte.bs-elmshorn.eu/~tre_itm20-2_veraltet/mysql.php?query=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": "A67deNxO5Ks0eQRI1fbn",
      },
    })
      .then((res) => res.json())
      .then((res) => setResult(res));
  }, [query]);
  return [result, setResult];
};

export default useSQL;
