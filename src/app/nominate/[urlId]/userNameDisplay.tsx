"use client";

import { useUser } from "./user-provider";

export default function UserNameDisplay() {
  const name = useUser();

  return <p>User: {name}</p>;
}
