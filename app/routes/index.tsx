import type { LinksFunction } from "@remix-run/node";
import { useCallback, useState } from "react";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { LoanSummary } from "~/components/LoanSummary/LoanSummary";
import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

const SLIDE_COUNT = 6;
const SLIDES = new Array(SLIDE_COUNT)
  .fill(undefined)
  .map((_, i) => `/slides/${i}.png`);

export default function Index() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const advanceSlide = useCallback(
    () => setCurrentSlide((prev) => ++prev % SLIDE_COUNT),
    []
  );

  return (
    <div className="wrapper flex flex-col bg-white">
      <Header />
      <div
        className="content flex h-full justify-center"
        onClick={advanceSlide}
      >
        <LoanSummary
          collateralAddress={"0xCa7cA7BcC765F77339bE2d648BA53ce9c8a262bD"}
        />
      </div>
      <Footer />
    </div>
  );
}
