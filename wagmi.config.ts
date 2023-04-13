import { defineConfig } from "@wagmi/cli";
import { etherscan } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "types/generatedABI.ts",
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY || "",
      contracts: [
        {
          name: "Quoter",
          address: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        },
        {
          name: "PaprController",
          address: "0x3b29c19ff2fcea0ff98d0ef5b184354d74ea74b0",
        },
      ],
      chainId: 1,
    }),
  ],
});
