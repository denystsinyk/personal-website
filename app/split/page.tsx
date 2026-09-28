import type { Metadata } from "next";
import SplitEditor from "./editor";
import "./split.css";
export const metadata: Metadata = {
  title: "Split a receipt — Denys Tsinyk",
  description: "Scan a receipt, assign items, and split tax and tip with friends.",
};
export const dynamic = 'force-static';

export default function SplitPage() {
  return (
    <>
      <a className="skip-link" href="#split-main">
        Skip to content
      </a>
      <SplitEditor />
    </>
  );
}
