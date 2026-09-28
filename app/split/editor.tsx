"use client";

import { useEffect } from "react";
import { markup } from "./markup";

export default function SplitEditor() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "./split.js";
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);
  return (
    <main id="split-main" className="split-app" dangerouslySetInnerHTML={{ __html: markup }} />
  );
}
