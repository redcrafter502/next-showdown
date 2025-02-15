"use client";

import { useEffect, useState, createContext } from "react";
import { getUser } from "./server";
import { useContext } from "react";

const UserContext = createContext({
  name: "",
  loading: true,
  error: "",
});

export function useUser() {
  return useContext(UserContext);
}

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUser()
      .then((user) => {
        setName(user?.name ?? "");
      })
      .catch((error: Error) => {
        setError(error.toString());
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = { name, loading, error };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
