import { useEffect, useState } from "react";
import { getUsers } from "../api/useApi";

export function useUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return users;
}
