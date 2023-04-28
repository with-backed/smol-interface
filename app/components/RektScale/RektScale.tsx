export function RektScale() {
  return (
    <div className="bg-[url('/scale/yaxis.svg')] w-2.5 bg-repeat-y bg-[center_top] flex flex-col justify-end">
      <div className="flex flex-col h-2/4">
        <div className="w-full bg-yikes h-16 rounded-lg"></div>
        <div className="w-full bg-risky h-16 rounded-lg"></div>
        <div className="w-full bg-fine flex-1 rounded-t-lg"></div>
      </div>
    </div>
  );
}
