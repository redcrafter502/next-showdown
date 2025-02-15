"use client";

import { useEffect, useState, createContext } from "react";
import { getUser } from "./server";
import { useContext } from "react";

const UserContext = createContext("");

export function useUser() {
  return useContext(UserContext);
}

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    getUser()
      .then((user) => {
        setName(user?.name ?? "");
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return <UserContext.Provider value={name}>{children}</UserContext.Provider>;
}
