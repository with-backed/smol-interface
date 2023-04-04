import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { APP_NAME } from "~/lib/constants";

import rainbowKitStyles from "@rainbow-me/rainbowkit/styles.css";
import styles from "~/tailwind.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: APP_NAME,
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: rainbowKitStyles },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap",
  },
];

const { chains, provider } = configureChains(
  [mainnet],
  [alchemyProvider({ apiKey: "" }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: APP_NAME,
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex justify-center items-center bg-no-repeat bg-cover">
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
