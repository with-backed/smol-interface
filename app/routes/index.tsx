export default function Index() {
  return (
    <div className="graph-papr h-full w-full flex flex-col items-center">
      <div className="my-14">
        <img src="/title.svg" alt="Title" />
      </div>
      <div className="w-4/5 overflow-hidden rounded-full bg-white mb-16">
        <img src="/toad-1-thrillin.svg" alt="Toad" />
      </div>
      <div className="flex flex-col items-center">
        <p className="w-44 text-center">Send ur meme on a thrillin adventure</p>
        <img className="absolute" src="/whiskers.svg" alt="Whiskers" />
      </div>
    </div>
  );
}
