"use client";

import React, { Suspense } from "react";
import ClientCreateInner from "./ClientCreateInner";

export default function ClientCreatePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ClientCreateInner />
    </Suspense>
  );
}
