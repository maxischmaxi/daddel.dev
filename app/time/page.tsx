import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time",
};

export default function TimePage() {
  return (
    <>
      <h1>Time</h1>
      <p>Hier kommt das Time-Spiel hin.</p>
    </>
  );
}
