import { BarChartBig, CreditCard, Users } from "lucide-react";
import { BottomNavLink } from "./BottomNavLink";
import { ThemePicker } from "./ThemePicker";

export const BottomNav = () => {
  return (
    <div className="flex items-center rounded-t-md bg-foreground py-2 dark:border-t-[1px] dark:bg-background">
      <BottomNavLink href="/dashboard" icon={BarChartBig}>
        Dashboard
      </BottomNavLink>
      <BottomNavLink href="/guaps" icon={CreditCard}>
        Accounts
      </BottomNavLink>
      <BottomNavLink href="/peers-and-billers" icon={Users}>
        Peers & Billers
      </BottomNavLink>

      <ThemePicker />
    </div>
  );
};
