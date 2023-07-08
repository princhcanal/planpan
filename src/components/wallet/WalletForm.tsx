import {
  WalletType,
  PaymentNetwork,
  type Wallet,
} from "../../server/db/schema/wallets";
import { mapEnumToLabelValuePair } from "../../utils";
import { Form } from "../form/Form";
import type { z } from "zod";
import { trpc } from "../../utils/trpc";
import { wallet } from "../../types/zod";
import { Button } from "../ui/Button";

interface WalletFormProps {
  existingWallet?: Wallet;
  onSuccess?: () => void;
}

export const WalletForm: React.FC<WalletFormProps> = ({
  existingWallet,
  onSuccess,
}) => {
  const utils = trpc.useContext();
  const createWallet = trpc.wallet.create.useMutation({
    onSuccess: () => {
      utils.wallet.getAll.invalidate();

      if (onSuccess) {
        onSuccess();
      }
    },
  });
  const editWallet = trpc.wallet.edit.useMutation({
    onSuccess: (_, editedWallet) => {
      utils.wallet.getAll.invalidate();
      utils.wallet.getOne.invalidate({ id: editedWallet.id });

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const onSubmit = (data: z.infer<typeof wallet>) => {
    if (!!existingWallet) {
      editWallet.mutate({ ...data, id: existingWallet.id });
    } else {
      createWallet.mutate(data);
    }
  };

  return (
    <Form
      schema={wallet}
      onSubmit={onSubmit}
      props={{
        name: {
          placeholder: "BPI Savings Account",
          label: "Name",
        },
        description: {
          placeholder: "Main Savings Account",
          label: "Description",
          type: "textarea",
        },
        balance: {
          placeholder: "5,000",
          label: "Balance",
          max: 1_000_000_000_000,
          currency: "₱",
        },
        type: {
          label: "Wallet Type",
          placeholder: "Choose Wallet Type",
          options: mapEnumToLabelValuePair(WalletType),
        },
        paymentNetwork: {
          label: "Payment Network",
          placeholder: "Choose Payment Network",
          options: mapEnumToLabelValuePair(PaymentNetwork),
        },
      }}
      defaultValues={{
        name: existingWallet?.name ?? undefined,
        description: existingWallet?.description ?? undefined,
        balance: existingWallet?.balance
          ? Number.parseFloat(existingWallet.balance)
          : undefined,
        type: existingWallet?.type ?? WalletType.SAVINGS,
        paymentNetwork: existingWallet?.paymentNetwork ?? undefined,
      }}
      renderAfter={() => (
        <Button
          className="mt-4 w-full"
          isLoading={createWallet.isLoading || editWallet.isLoading}
          type="submit"
        >
          Save
        </Button>
      )}
    />
  );
};
