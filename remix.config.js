/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  future: {
    unstable_tailwind: true,
    unstable_postcss: true,
  },
  serverDependenciesToBundle: [
    "@rainbow-me/rainbowkit",
    "@rainbow-me/rainbowkit/wallets",
    /^@?wagmi.*/,
    /.*/,
  ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
};
