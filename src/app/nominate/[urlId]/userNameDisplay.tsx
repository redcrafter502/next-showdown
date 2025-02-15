"use client";

import { useUser } from "./user-provider";

export default function UserNameDisplay() {
  const { name, loading, error } = useUser();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return <p>User: {name}</p>;
}
