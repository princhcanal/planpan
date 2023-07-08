import numeral from "numeral";
import Link from "next/link";
import type {
  PaymentNetwork,
  Wallet,
  WalletType,
} from "../../server/db/schema/wallets";
import { WalletTypeIcon } from "./WalletTypeIcon";
import { PaymentNetworkIcon } from "./PaymentNetworkIcon";

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
        <WalletTypeIcon walletType={wallet.type as WalletType} />
      </div>

      <p className="text-3xl font-extrabold">
        &#8369; <span>{numeral(wallet.balance).format("0,0", Math.floor)}</span>
        <span className="text-lg">{numeral(wallet.balance).format(".00")}</span>
      </p>

      <div className="flex items-center justify-between">
        <div className="overflow-hidden">
          <p className="truncate font-semibold">{wallet.name}</p>
          <p className="truncate text-slate-300">{wallet.description}</p>
        </div>

        {wallet.paymentNetwork && (
          <PaymentNetworkIcon
            paymentNetwork={wallet.paymentNetwork as PaymentNetwork}
          />
        )}
      </div>
    </Link>
  );
};
