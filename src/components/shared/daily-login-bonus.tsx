"use client";

import { useEffect, useRef } from "react";
import { claimDailyLoginXp } from "@/lib/actions/profile";

export function DailyLoginBonus() {
  const claimedRef = useRef(false);

  useEffect(() => {
    if (claimedRef.current) return;
    claimedRef.current = true;

    claimDailyLoginXp().then((res) => {
      if (res.claimed) {
        // Daily login claimed successfully
      }
    });
  }, []);

  return null;
}
