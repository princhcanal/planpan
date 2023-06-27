import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type z } from "zod";
import { Form } from "../../components/form/Form";
import { Button } from "../../components/ui/Button";
import { trpc } from "../../utils/trpc";
import numeral from "numeral";
import { mapEnumToLabelValuePair } from "../../utils";
import { useForm } from "react-hook-form";
import {
  transaction,
  transactionRefine,
  transactionRefineMessage,
} from "../../types/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { TransactionType } from "../../server/db/schema/transactions";
import { TransactionTable } from "../../components/transaction/TransactionTable";
import { type LabelValuePair } from "../../components/form/SelectInput";
import { ArrowLeftRight } from "lucide-react";
import { WalletActions } from "../../components/wallet/WalletActions";
import { Spinner } from "../../components/ui/Spinner";

const WalletDetails: NextPage = () => {
  const {
    query: { id },
  } = useRouter();
  const utils = trpc.useContext();
  const wallets = trpc.wallet.getAll.useQuery();
  const walletsExcludingSelf = wallets.data?.filter(
    (wallet) => wallet.id !== id
  );
  const recipients = trpc.recipient.getAll.useQuery();
  const wallet = trpc.wallet.getOne.useQuery(
    { id: id as string },
    { enabled: !!id }
  );
  const { data: transactionsData, isFetching: transactionsFetching } =
    trpc.transaction.getTransactionsByWallet.useQuery(
      {
        id: id as string,
      },
      { enabled: !!id }
    );
  const createTransaction = trpc.transaction.createTransaction.useMutation({
    onSuccess: () => {
      utils.wallet.getOne.invalidate({ id: id as string });
      utils.transaction.getTransactionsByWallet.invalidate({
        id: id as string,
      });
      setIsCreateDialogOpen(false);
    },
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const transactionSchema = transaction.refine(transactionRefine, {
    message: transactionRefineMessage,
    path: ["internalWalletId", "recipientId"],
  });

  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    if (wallet.data?.balance) {
      if (
        watchAmount > Number.parseFloat(wallet.data.balance) &&
        watchType === TransactionType.DEBIT
      ) {
      } else {
        createTransaction.mutate(data);
      }
    }
  };

  const form = useForm<z.infer<typeof transactionSchema>>();

  const defaultValues = {
    type: TransactionType.DEBIT,
    walletId: wallet.data?.id,
    sendToInternalWallet: false,
  };

  const watchType = form.watch("type");
  const watchSendToInternalWallet = form.watch("sendToInternalWallet");
  const watchAmount = form.watch("amount");
  const watchRecipientId = form.watch("recipientId");
  const watchInternalWalletId = form.watch("internalWalletId");

  const [amountErrorMessage, setAmountErrorMessage] = useState("");
  const [walletErrorMessage, setWalletErrorMessage] = useState("");

  useEffect(() => {
    if (watchType === TransactionType.CREDIT) {
      form.resetField("sendToInternalWallet", { defaultValue: false });
      form.resetField("internalWalletId", {
        defaultValue: undefined,
      });
    }
  }, [watchType, form]);

  useEffect(() => {
    form.resetField("recipientId", {
      defaultValue: undefined,
    });
    form.resetField("internalWalletId", {
      defaultValue: undefined,
    });
  }, [watchSendToInternalWallet, form]);

  useEffect(() => {
    if (wallet.data?.balance !== null && wallet.data?.balance !== undefined) {
      if (
        watchAmount > Number.parseFloat(wallet.data.balance) &&
        watchType === TransactionType.DEBIT
      ) {
        setAmountErrorMessage(
          `Not enough balance (₱ ${numeral(wallet.data.balance).format(
            "0,0.00"
          )})`
        );
      } else {
        setAmountErrorMessage("");
      }
    }
  }, [watchAmount, watchType, form, wallet.data?.balance]);

  useEffect(() => {
    if (!!watchRecipientId || !!watchInternalWalletId) {
      setWalletErrorMessage("");
    }
  }, [watchRecipientId, watchInternalWalletId]);

  const setWalletIdErrors = () => {
    if (!watchRecipientId && !watchInternalWalletId) {
      setWalletErrorMessage("Must choose either Wallet or Recipient");
    }
  };

  const resetErrorMessages = () => {
    setWalletErrorMessage("");
    setAmountErrorMessage("");
  };

  const walletFilterOptions: LabelValuePair[] =
    wallets.data?.map((g) => ({
      label: g.name,
      value: g.id,
    })) ?? [];
  const externalWalletFilterOptions: LabelValuePair[] =
    recipients.data?.map((g) => ({
      label: g.name,
      value: g.id,
    })) ?? [];

  return wallet.data ? (
    <div>
      <div className="mb-12 flex justify-between gap-8">
        <div>
          <p className="text-sm text-muted-foreground">Balance</p>
          <h1 className="mb-2 text-4xl font-extrabold text-highlight">
            &#8369;{" "}
            <span>
              {numeral(wallet.data.balance).format("0,0", Math.floor)}
            </span>
            <span className="text-lg">
              {numeral(wallet.data.balance).format(".00")}
            </span>
          </h1>
          <h2 className="text-xl font-semibold">{wallet.data.name}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {wallet.data.description}
          </p>
        </div>

        <div className="flex gap-2">
          <WalletActions wallet={wallet.data} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg text-muted-foreground">
              Transaction History
            </h3>
            {transactionsFetching && <Spinner />}
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              form.reset(defaultValues);
              resetErrorMessages();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" icon={ArrowLeftRight}>
                Create Transaction
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Transaction</DialogTitle>
              </DialogHeader>

              <Form
                form={form}
                schema={transactionSchema}
                onSubmit={onSubmit}
                props={{
                  walletId: {
                    type: "hidden",
                  },
                  type: {
                    options: mapEnumToLabelValuePair(TransactionType),
                    label: "Type",
                  },
                  internalWalletId: {
                    label: "Send To",
                    placeholder: "Choose Wallet",
                    options:
                      walletsExcludingSelf?.map((wallet) => ({
                        label: wallet.name,
                        value: wallet.id,
                      })) ?? [],
                    hidden: !watchSendToInternalWallet,
                    errorMessage: walletErrorMessage,
                  },
                  recipientId: {
                    label: "Send To",
                    placeholder: "Choose Peer/Biller",
                    options:
                      recipients.data?.map((wallet) => ({
                        label: wallet.name,
                        value: wallet.id,
                      })) ?? [],
                    hidden: watchSendToInternalWallet ?? false,
                    errorMessage: walletErrorMessage,
                  },
                  sendToInternalWallet: {
                    text: "Send to wallet?",
                    disabled: watchType === TransactionType.CREDIT,
                  },
                  amount: {
                    placeholder: "5,000",
                    label: "Amount",
                    max: 1_000_000_000_000,
                    errorMessage: amountErrorMessage,
                    currency: "₱",
                  },
                  description: {
                    placeholder: "Groceries",
                    label: "Description",
                    type: "textarea",
                  },
                  date: {
                    label: "Date",
                  },
                }}
                defaultValues={defaultValues}
                renderAfter={() => (
                  <Button
                    className="mt-4 w-full"
                    isLoading={createTransaction.isLoading}
                    type="submit"
                    onClick={() => {
                      setWalletIdErrors();
                    }}
                  >
                    Save
                  </Button>
                )}
              />
            </DialogContent>
          </Dialog>
        </div>

        <TransactionTable
          transactions={transactionsData ?? []}
          walletId={id as string}
          wallets={walletFilterOptions.concat(externalWalletFilterOptions)}
        />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default WalletDetails;
