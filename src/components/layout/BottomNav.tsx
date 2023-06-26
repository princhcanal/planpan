import { BarChartBig, CreditCard, Users } from "lucide-react";
import { BottomNavLink } from "./BottomNavLink";
import { ThemePicker } from "./ThemePicker";

export const BottomNav = () => {
  return (
    <div className="flex items-center rounded-t-md bg-foreground py-2 dark:border-t-[1px] dark:bg-background">
      <BottomNavLink href="/dashboard" icon={BarChartBig}>
        Dashboard
      </BottomNavLink>
      <BottomNavLink href="/wallets" icon={CreditCard}>
        Wallets
      </BottomNavLink>
      <BottomNavLink href="/recipients" icon={Users}>
        Recipients
      </BottomNavLink>

      <ThemePicker />
    </div>
  );
};
