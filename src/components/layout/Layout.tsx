import { type ReactElement } from "react";
import { SideNav } from "./SideNav";
import { BottomNav } from "./BottomNav";

export const Layout = (page: ReactElement) => {
  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden">
      <div className="hidden xl:block">
        <SideNav />
      </div>

      <main className="mx-auto h-screen max-w-screen-2xl flex-grow overflow-y-auto px-6 pb-24 pt-14">
        {page}
      </main>

      <div className="absolute bottom-0 left-0 w-full bg-background xl:hidden">
        <BottomNav />
      </div>
    </div>
  );
};
