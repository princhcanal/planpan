import { type ReactElement } from "react";

export const CenterLayout = (page: ReactElement) => {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      {page}
    </main>
  );
};
