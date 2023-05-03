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
import { configureChains, createClient, goerli, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { APP_NAME } from "~/lib/constants";
import { CenterProvider } from "@center-inc/react";
import rainbowKitStyles from "@rainbow-me/rainbowkit/styles.css";
import type { SupportedToken } from "./lib/config";
import { configs } from "./lib/config";
import type { PaprControllerByIdQuery } from "./gql/graphql";
import { PaprControllerByIdDocument } from "./gql/graphql";
import type { PaprController } from "./hooks/usePaprController";
import { ControllerContextProvider } from "./hooks/usePaprController";
import tailwindStyles from "~/tailwind.css";
import customStyles from "~/styles/index.css";
import { Header, HeaderBar } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { OracleInfoProvider } from "./hooks/useOracleInfo";
import { useMemo } from "react";
import { TimestampProvider } from "./hooks/useTimestamp";
import { useDisclosureState } from "reakit/Disclosure";
import { HeaderDisclosureContextProvider } from "./hooks/useHeaderDisclosureState/useHeaderDisclosureState";
import { TargetProvider } from "./hooks/useTarget";
import { LavaExplainer, ValueExplainer } from "./components/RektScale";
import { useExplainerStore } from "./lib/explainerStore";

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

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli],
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
  webSocketProvider,
});

export const loader = async () => {
  const { controllerAddress, paprSubgraph } =
    configs[process.env.TOKEN as SupportedToken];
  const paprClient = createUrqlClient({
    url: paprSubgraph,
    exchanges: [cacheExchange, fetchExchange],
  });
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
  const headerDisclosureState = useDisclosureState();

  const allowedCollateral = useMemo(() => {
    return serverSideData.paprSubgraphData.allowedCollateral.map(
      (ac) => ac.token.id
    );
  }, [serverSideData.paprSubgraphData.allowedCollateral]);

  const { centerKey, centerNetwork, paprSubgraph } =
    configs[serverSideData.env.TOKEN as SupportedToken];

  const paprClient = useMemo(() => {
    return createUrqlClient({
      url: paprSubgraph,
      exchanges: [cacheExchange, fetchExchange],
    });
  }, [paprSubgraph]);

  const activeExplainer = useExplainerStore((s) => s.activeExplainer);

  const pageContent = useMemo(() => {
    if (activeExplainer === "lava") {
      return <LavaExplainer />;
    }
    if (activeExplainer === "value") {
      return <ValueExplainer />;
    }
    return (
      <>
        <Header />
        <div className="wrapper relative flex flex-col">
          <HeaderBar />
          <Outlet />
        </div>

        <Footer />
      </>
    );
  }, [activeExplainer]);

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
              <TimestampProvider>
                <TargetProvider>
                  <OracleInfoProvider collections={allowedCollateral}>
                    <ControllerContextProvider
                      value={serverSideData.paprSubgraphData as PaprController}
                    >
                      <CenterProvider
                        apiKey={centerKey}
                        network={centerNetwork as any}
                      >
                        <HeaderDisclosureContextProvider
                          value={headerDisclosureState}
                        >
                          {pageContent}
                          <ScrollRestoration />
                          <Scripts />
                          <LiveReload />
                          <script
                            dangerouslySetInnerHTML={{
                              __html: `window.ENV = ${JSON.stringify(
                                serverSideData.env
                              )}`,
                            }}
                          />
                        </HeaderDisclosureContextProvider>
                      </CenterProvider>
                    </ControllerContextProvider>
                  </OracleInfoProvider>
                </TargetProvider>
              </TimestampProvider>
            </RainbowKitProvider>
          </WagmiConfig>
        </UrqlProvider>
      </body>
    </html>
  );
}
