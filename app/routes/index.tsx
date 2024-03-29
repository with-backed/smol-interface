import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname === "/") {
    return redirect("/begin");
  }
  return null;
};

export default function Index() {
  return <></>;
}
