import { Link, useLocation } from "@remix-run/react";
import { useMemo } from "react";
import { Back } from "~/components/Back";
import { Forward } from "~/components/Forward";

export const PAGES = ["/begin", "/eli5", "/hero", "/lava", "/go"];

interface PageIndex {
  index: number;
  nextPath: string | undefined;
  prevPath: string | undefined;
}

function useCurrentPageIndex(): PageIndex {
  const { pathname } = useLocation();

  const value = useMemo(() => {
    const index = PAGES.indexOf(pathname);
    const nextPath = PAGES[index + 1];
    const prevPath = PAGES[index - 1];

    return {
      index,
      nextPath,
      prevPath,
    };
  }, [pathname]);

  return value;
}

type ArrowLinkProps = {
  to?: string;
  direction: "forward" | "back";
};

function ArrowLink({ direction, to }: ArrowLinkProps) {
  const Arrow = direction === "forward" ? Forward : Back;
  if (!to) {
    return (
      <div className="cursor-not-allowed opacity-30 m-[10px]">
        <Arrow />
      </div>
    );
  }
  return (
    <div className="m-[10px] bg-medium-grey rounded-lg hover:bg-[#CCCCCC]">
      <Link to={to}>
        <Arrow />
      </Link>
    </div>
  );
}

export function Footer() {
  const { index, nextPath, prevPath } = useCurrentPageIndex();
  return (
    <footer className="flex justify-between items-center bg-light-grey text-black h-[90px]">
      <ArrowLink to={prevPath} direction="back" />
      <span>
        {index + 1} of {PAGES.length}
      </span>
      <ArrowLink to={nextPath} direction="forward" />
    </footer>
  );
}
