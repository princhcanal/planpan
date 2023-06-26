import numeral from "numeral";
import Link from "next/link";
import { Circle, CreditCard } from "lucide-react";
import { type Wallet } from "../../server/db/schema/wallets";

interface WalletItemProps {
  wallet: Wallet;
}

export const WalletItem: React.FC<WalletItemProps> = ({ wallet }) => {
  return (
    <Link
      href={`/wallets/${wallet.id}`}
      className="flex h-52 max-w-full basis-full flex-col justify-between rounded-xl bg-gradient-to-br from-highlight to-[#3D4793] p-4 text-background dark:text-foreground md:max-w-[48%] md:basis-[48%] lg:max-w-[32%] lg:basis-[32%]"
    >
      <div className="flex items-center justify-end">
        {/* TODO: ( insert wallet type ) */}
        <CreditCard />
      </div>

      <p className="text-3xl font-extrabold">
        &#8369; <span>{numeral(wallet.balance).format("0,0")}</span>
        <span className="text-lg">{numeral(wallet.balance).format(".00")}</span>
      </p>

      <div className="flex items-center justify-between">
        <div className="overflow-hidden">
          <p className="truncate font-semibold">{wallet.name}</p>
          <p className="truncate text-slate-400 dark:text-muted-foreground">
            {wallet.description}
          </p>
        </div>

        <div className="flex">
          {/* TODO: insert card type icon (if applicable) */}
          <Circle fill="red" color="red" size="40" />
          <Circle
            fill="orange"
            color="orange"
            className="ml-[-0.75em]"
            size="40"
          />
        </div>
      </div>
    </Link>
  );
};
