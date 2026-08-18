import Logout from "@/components/ui/auth/Logout";

export function SidebarAccountActions() {
  return (
    <div className="mt-auto border-t border-white/10">
      <Logout className="flex w-full items-center border-0 border-l-[3px] border-l-transparent bg-transparent px-4.5 py-3.5 text-left text-sm font-bold text-[#dce4ef] hover:bg-(--nav-active) hover:text-white disabled:cursor-not-allowed disabled:opacity-60 max-[720px]:justify-center max-[720px]:border-l-2 max-[720px]:px-1 max-[720px]:text-xs" />
    </div>
  );
}
