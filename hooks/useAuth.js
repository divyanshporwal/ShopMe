"use client";

import { useEffect, useState } from "react";

/**
 * @typedef {{ _id?: string; name?: string; email?: string; role?: string }} AuthUser
 */

export default function useAuth() {
  /** @type {[AuthUser | null, import("react").Dispatch<import("react").SetStateAction<AuthUser | null>>]} */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
