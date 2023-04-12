import type { LinksFunction } from "@remix-run/node";
import { ethers } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { usePoolQuote } from "~/hooks/usePoolQuote/usePoolQuote";
import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

const SLIDE_COUNT = 6;
const SLIDES = new Array(SLIDE_COUNT)
  .fill(undefined)
  .map((_, i) => `/slides/${i}.png`);

export default function Index() {
  console.log("re-render");
  const [currentSlide, setCurrentSlide] = useState(0);

  const advanceSlide = useCallback(
    () => setCurrentSlide((prev) => ++prev % SLIDE_COUNT),
    []
  );

  usePoolQuote({
    amount: useMemo(() => ethers.utils.parseEther("1"), []),
    inputToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    outputToken: "0x320aaab3038bc08317f5a4be19ea1d9608551d79",
    tradeType: "exactIn",
  });

  return (
    <div className="wrapper flex flex-col bg-white">
      <Header />
      <div
        className="content flex h-full items-center justify-center"
        onClick={advanceSlide}
      >
        <img src={SLIDES[currentSlide]} alt="" />
      </div>
      <Footer />
    </div>
  );
}
