import { CreditCard } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";

export const GuapSkeleton = () => {
  return (
    <Skeleton className="flex h-52 max-w-full basis-full flex-col justify-between rounded-xl p-4 text-background dark:text-foreground md:max-w-[48%] md:basis-[48%] lg:max-w-[32%] lg:basis-[32%]">
      <div className="flex items-center justify-end">
        <CreditCard className="text-slate-700" />
      </div>

      <div className="flex items-center gap-2">
        <p className="text-3xl font-extrabold text-slate-700">&#8369;</p>
        <Skeleton className="h-10 w-[50%] rounded-md bg-slate-700"></Skeleton>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full">
          <Skeleton className="mb-2 h-2 w-[50%] rounded-md bg-slate-700" />
          <Skeleton className="h-2 w-[75%] rounded-md bg-slate-700" />
        </div>

        <div className="flex">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
          <Skeleton className="ml-[-0.75em] h-10 w-10 rounded-full bg-slate-700" />
        </div>
      </div>
    </Skeleton>
  );
};
