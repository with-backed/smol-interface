export default function Index() {
  return (
    <div className="graph-papr h-full w-full flex flex-col justify-evenly p-3">
      <img src="/title.svg" alt="Title" />
      <img
        src="/1-super-dance.svg"
        className="max-h-[323px] scalable"
        alt="Toad"
      />
      <div className="flex flex-col items-center">
        <p className="w-44 text-center">Send ur meme on a thrillin adventure</p>
        <img className="absolute" src="/whiskers.svg" alt="Whiskers" />
      </div>
    </div>
  );
}
