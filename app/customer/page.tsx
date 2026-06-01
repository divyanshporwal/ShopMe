"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {

    const verifyPayment = async () => {

      try {

        const session_id = searchParams.get("session_id");

        console.log("SESSION ID:", session_id);

        if (!session_id) return;

        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id }),
        });

        const data = await res.json();

        console.log("VERIFY RESPONSE:", data);

        if (data.success) {
          router.push("/customer/orders");
        }

      } catch (error) {
        console.log(error);
      }
    };

    verifyPayment();

  }, []);

  return (
    <div className="h-screen flex items-center justify-center text-2xl font-bold">
      Payment Successful...
    </div>
  );
}