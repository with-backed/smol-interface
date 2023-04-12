import type { LinksFunction } from "@remix-run/node";
import { useCallback, useState } from "react";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
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
        className="content flex h-full items-center justify-center"
        onClick={advanceSlide}
      >
        <img src={SLIDES[currentSlide]} alt="" />
      </div>
      <Footer />
    </div>
  );
}
