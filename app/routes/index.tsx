export default function Index() {
  return (
    <div className="graph-papr h-full w-full flex flex-col items-center justify-center gap-14">
      <img src="/title.svg" alt="Title" />
      <div className="w-4/5 overflow-hidden rounded-full bg-white">
        <img src="/toad-1-thrillin.svg" alt="Toad" className="p-4" />
      </div>
      <div className="flex flex-col items-center">
        <p className="w-44 text-center">Send ur meme on a thrillin adventure</p>
        <img className="absolute" src="/whiskers.svg" alt="Whiskers" />
      </div>
    </div>
  );
}
