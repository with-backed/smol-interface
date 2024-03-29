const ALT = `
Toad says:
Lock me up for temporary money!
Put that ETH to work.
Then come back 2 rescue me.
`;

export default function Eli5() {
  return (
    <div className="h-[calc(100%-50px)] m-auto">
      <div className="h-full w-full flex flex-col items-center justify-center py-2">
        <img src="/2-super-dance.svg" className="max-h-full" alt={ALT} />
      </div>
    </div>
  );
}
