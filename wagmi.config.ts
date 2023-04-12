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
      ],
      chainId: 1,
    }),
  ],
});
