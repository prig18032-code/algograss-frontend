// app/demo/page.js
import DemoClient from "./DemoClient";

export const metadata = {
  title: "Interactive Demo – AlgoGrass",
  description: "Try forecasting and sustainability analytics in your browser.",
};

export default function DemoPage() {
  return <DemoClient />;
}
