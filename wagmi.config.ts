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
          name: "SwapRouter",
          address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        },
        {
          name: "PaprController",
          address: {
            1: "0x3b29c19ff2fcea0ff98d0ef5b184354d74ea74b0",
            5: "0x937968d77f8e312574d659ccd9a527ec063ff601",
          },
        },
      ],
      chainId: 1,
    }),
  ],
});
