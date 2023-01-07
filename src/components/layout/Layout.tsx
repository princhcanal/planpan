import { type ReactElement } from "react";
import { Navbar } from "./Navbar";

export const Layout = (page: ReactElement) => {
  return (
    <div className="flex min-h-screen">
      <Navbar />

      <main className="h-screen flex-grow overflow-y-auto bg-gray-100 px-6 pt-8 pb-24 text-gray-800">
        {page}
      </main>
    </div>
  );
};
