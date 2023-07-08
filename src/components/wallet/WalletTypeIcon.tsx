import {
  Banknote,
  CandlestickChart,
  CreditCard,
  type LucideIcon,
  PiggyBank,
  Smartphone,
} from "lucide-react";
import { WalletType } from "../../server/db/schema/wallets";

interface WalletTypeIconProps {
  walletType: WalletType;
}

export const WalletTypeIcon: React.FC<WalletTypeIconProps> = ({
  walletType,
}) => {
  let Icon: LucideIcon;
  switch (walletType) {
    case WalletType.SAVINGS:
      Icon = PiggyBank;
      break;
    case WalletType.CASH:
      Icon = Banknote;
      break;
    case WalletType.CREDIT:
      Icon = CreditCard;
      break;
    case WalletType.E_WALLET:
      Icon = Smartphone;
      break;
    case WalletType.INVESTMENT:
      Icon = CandlestickChart;
      break;
    default:
      Icon = PiggyBank;
  }

  return (
    <div className="flex items-center gap-2">
      <Icon />
      <span>{walletType}</span>
    </div>
  );
};
