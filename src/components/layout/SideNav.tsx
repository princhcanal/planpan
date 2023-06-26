import { BarChartBig, CreditCard, Users } from "lucide-react";
import { SideNavLink } from "./SideNavLink";
import { ThemePicker } from "./ThemePicker";

export const SideNav = () => {
  return (
    <div className="flex h-screen w-60 flex-col justify-between rounded-e-md bg-foreground px-4 pb-4 pt-14 text-gray-100 dark:border-r-[1px] dark:bg-background">
      <div className="flex flex-col">
        <h2 className="mb-8 px-4 text-4xl font-bold text-gray-600">PlanPan</h2>

        <SideNavLink href="/dashboard" icon={BarChartBig}>
          Dashboard
        </SideNavLink>
        <SideNavLink href="/wallets" icon={CreditCard}>
          Wallets
        </SideNavLink>
        <SideNavLink href="/recipients" icon={Users}>
          Recipients
        </SideNavLink>
      </div>

      <div className="self-end">
        <ThemePicker />
      </div>
    </div>
  );
};
