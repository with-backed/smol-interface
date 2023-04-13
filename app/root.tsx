import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  createClient as createUrqlClient,
  cacheExchange,
  fetchExchange,
  Provider as UrqlProvider,
} from "urql";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { APP_NAME, MAINNET_PAPR_SUBGRAPH } from "~/lib/constants";

import rainbowKitStyles from "@rainbow-me/rainbowkit/styles.css";
import type { SupportedToken } from "./lib/config";
import { configs } from "./lib/config";
import type { PaprControllerByIdQuery } from "./gql/graphql";
import { PaprControllerByIdDocument } from "./gql/graphql";
import type { PaprController } from "./hooks/usePaprController";
import { ControllerContextProvider } from "./hooks/usePaprController";
import tailwindStyles from "~/tailwind.css";
import customStyles from "~/styles/index.css";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { OracleInfoProvider } from "./hooks/useOracleInfo/useOracleInfo";
import { useMemo } from "react";

declare global {
  interface Window {
    ENV: {
      TOKEN: SupportedToken;
      ALCHEMY_KEY: string;
      ETHERSCAN_API_KEY: string;
    };
  }
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: APP_NAME,
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: customStyles },
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
  [
    alchemyProvider({
      apiKey:
        typeof window === "undefined"
          ? process.env.ALCHEMY_KEY || ""
          : window.ENV.ALCHEMY_KEY || "",
    }),
    publicProvider(),
  ]
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

const paprClient = createUrqlClient({
  url: MAINNET_PAPR_SUBGRAPH,
  exchanges: [cacheExchange, fetchExchange],
});

export const loader = async () => {
  const controllerAddress =
    configs[process.env.TOKEN as SupportedToken].controllerAddress;
  const queryResult = await paprClient
    .query<PaprControllerByIdQuery>(PaprControllerByIdDocument, {
      id: controllerAddress,
    })
    .toPromise();
  if (!queryResult.data?.paprController) {
    throw new Error(
      `Unable to find subgraph data for controller ${controllerAddress}`
    );
  }
  return json({
    paprSubgraphData: { ...queryResult.data.paprController },
    env: {
      ALCHEMY_KEY: process.env.ALCHEMY_KEY,
      QUOTER: process.env.QUOTER,
      TOKEN: process.env.TOKEN,
      ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    },
  });
};

export default function App() {
  const serverSideData = useLoaderData<typeof loader>();

  const allowedCollateral = useMemo(() => {
    return serverSideData.paprSubgraphData.allowedCollateral.map(
      (ac) => ac.token.id
    );
  }, [serverSideData.paprSubgraphData.allowedCollateral]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex justify-center items-center bg-no-repeat bg-cover">
        <UrqlProvider value={paprClient}>
          <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
              <OracleInfoProvider collections={allowedCollateral}>
                <ControllerContextProvider
                  value={serverSideData.paprSubgraphData as PaprController}
                >
                  <Header />
                  <div className="grow">
                    <Outlet />
                  </div>
                  <ScrollRestoration />
                  <script
                    dangerouslySetInnerHTML={{
                      __html: `window.ENV = ${JSON.stringify(
                        serverSideData.env
                      )}`,
                    }}
                  />
                  <Scripts />
                  <LiveReload />
                  <Footer />
                </ControllerContextProvider>
              </OracleInfoProvider>
            </RainbowKitProvider>
          </WagmiConfig>
        </UrqlProvider>
      </body>
    </html>
  );
}
