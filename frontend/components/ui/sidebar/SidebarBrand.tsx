import Image from "next/image";

export function SidebarBrand() {
  return (
    <div
      className="flex justify-center gap-2 py-2 h-max border-b-[0.05mm] border-gray-300 font-extrabold"
      aria-label="Pasture Plus home"
    >
      <Image height={30} width={60} className="" src="/logo.png" alt="Pasture Plus Logo"/>
      <h1 className="flex flex-col items-start gap-0 justify-start text-2xl">
        <span className="text-[#0b4419] p-0 m-0">Pasture</span>
        <span className="text-[#73c74b] p-0 m-0">Plus+</span>
      </h1>
    </div>
  );
}
