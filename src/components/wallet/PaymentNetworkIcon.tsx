import type { PaymentNetwork } from "../../server/db/schema/wallets";
import Image from "next/image";

interface PaymentNetworkIconProps {
  paymentNetwork: PaymentNetwork;
  size?: number;
}

const DEFAULT_SIZE = 60;

export const PaymentNetworkIcon: React.FC<PaymentNetworkIconProps> = ({
  paymentNetwork,
  size,
}) => {
  return (
    <Image
      alt={paymentNetwork}
      src={`/bank_icons/${paymentNetwork.toLowerCase()}.svg`}
      width={size ?? DEFAULT_SIZE}
      height={size ?? DEFAULT_SIZE}
    />
  );
};
