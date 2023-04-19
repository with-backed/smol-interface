export default function Two() {
  return (
    <div className="h-full w-full flex flex-col items-center">
      <div className="-mt-6">
        <p className="w-44 text-center relative left-[22px] top-[72px]">
          Lock me up for temporary money!
        </p>
        <img className="z-0" src="/2-bubble-1.svg" alt="Bubble 1" />
      </div>
      <img src="/toad-2-money.svg" alt="Toad Money" />
      <div className="relative">
        <div className="relative bottom-[128px] right-[86px]">
          <div className="w-[7.5rem] relative left-[18px] top-[136px]">
            <p className="text-center">Put that ETH to work</p>
            <div className="flex flex-row justify-evenly items-center">
              <img
                src="/uniswap.png"
                alt="Uniswap"
                className="w-[30px] h-[30px]"
              />
              <div>??</div>
              <img
                src="/opensea.png"
                alt="OpenSea"
                className="w-[30px] h-[30px]"
              />
            </div>
          </div>

          <img src="/2-bubble-2.svg" alt="Bubble 2" />
        </div>
        <div className="relative bottom-[312px] left-[84px]">
          <p className="w-[8.5rem] text-center relative left-[17px] top-[134px]">
            Then come back 2 rescue me
          </p>
          <img src="/2-bubble-3.svg" alt="Bubble 3" />
        </div>
      </div>
    </div>
  );
}
