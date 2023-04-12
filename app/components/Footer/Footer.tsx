import { Link, useLocation } from "@remix-run/react";
import { useMemo } from "react";
import { Back } from "~/components/Back";
import { Forward } from "~/components/Forward";

const PAGES = ["/", "/intro"];

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
      <div className="opacity-25 cursor-not-allowed">
        <Arrow />
      </div>
    );
  }
  return (
    <Link to={to}>
      <Arrow />
    </Link>
  );
}

export function Footer() {
  const { index, nextPath, prevPath } = useCurrentPageIndex();
  return (
    <footer className="flex justify-between items-center bg-black text-white">
      <ArrowLink to={prevPath} direction="back" />
      <span>
        {index + 1} of {PAGES.length}
      </span>
      <ArrowLink to={nextPath} direction="forward" />
    </footer>
  );
}
