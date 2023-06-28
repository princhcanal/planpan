import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type z } from "zod";
import { Form } from "../../components/form/Form";
import { Button } from "../../components/ui/Button";
import { type RouterOutputs, trpc } from "../../utils/trpc";
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
import { ArrowLeftRight, Minus, Plus, Send, Wallet } from "lucide-react";
import { WalletActions } from "../../components/wallet/WalletActions";
import { Spinner } from "../../components/ui/Spinner";

export type Wallet = RouterOutputs["wallet"]["getAll"][number];

const WalletDetails: NextPage = () => {
  const {
    query: { id },
  } = useRouter();
  const utils = trpc.useContext();
  const wallets = trpc.wallet.getAll.useQuery();
  const walletsExcludingSelf = wallets.data?.filter(
    (wallet) => wallet.id !== id
  );
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

  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    if (
      watchType === TransactionType.INCOME ||
      (wallet.data?.balance !== null &&
        wallet.data?.balance !== undefined &&
        watchAmount <= Number.parseFloat(wallet.data.balance))
    ) {
      createTransaction.mutate(data);
    }
  };

  const transactionSchema = transaction.refine(transactionRefine, {
    message: transactionRefineMessage,
    path: ["internalWalletId"],
  });

  const form = useForm<z.infer<typeof transactionSchema>>();

  const defaultValues = {
    type: TransactionType.EXPENSE,
    walletId: wallet.data?.id,
  };

  const watchType = form.watch("type");
  const watchAmount = form.watch("amount");
  const watchInternalWalletId = form.watch("internalWalletId");

  const [amountErrorMessage, setAmountErrorMessage] = useState("");
  const [walletErrorMessage, setWalletErrorMessage] = useState("");

  useEffect(() => {
    if (watchType !== TransactionType.TRANSFER) {
      form.resetField("internalWalletId", {
        defaultValue: undefined,
      });
    }
  }, [watchType, form]);

  useEffect(() => {
    if (
      (watchType === TransactionType.TRANSFER && !!watchInternalWalletId) ||
      watchType !== TransactionType.TRANSFER
    ) {
      setWalletErrorMessage("");
    }
  }, [watchInternalWalletId, watchType]);

  useEffect(() => {
    if (
      wallet.data?.balance !== null &&
      wallet.data?.balance !== undefined &&
      watchAmount > Number.parseFloat(wallet.data.balance) &&
      watchType !== TransactionType.INCOME
    ) {
      setAmountErrorMessage(
        `Not enough balance (₱ ${numeral(wallet.data.balance).format(
          "0,0.00"
        )})`
      );
    } else {
      setAmountErrorMessage("");
    }
  }, [watchAmount, watchType, form, wallet.data?.balance]);

  const resetErrorMessages = () => {
    setWalletErrorMessage("");
    setAmountErrorMessage("");
  };

  const walletFilterOptions: LabelValuePair[] =
    walletsExcludingSelf?.map((g) => ({
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
                    label: "Source Account",
                    placeholder: "Choose Wallet",
                    options:
                      wallets.data?.map((wallet) => ({
                        label: wallet.name,
                        value: wallet.id,
                      })) ?? [],
                    disabled: true,
                  },
                  type: {
                    options: mapEnumToLabelValuePair(TransactionType, [
                      Wallet,
                      Send,
                      ArrowLeftRight,
                    ]),
                    defaultValue: TransactionType.EXPENSE,
                  },
                  name: {
                    label: "Name",
                    placeholder: "Jollibee",
                  },
                  internalWalletId: {
                    label: "Destination Account",
                    placeholder: "Choose Wallet",
                    options:
                      walletsExcludingSelf?.map((wallet) => ({
                        label: wallet.name,
                        value: wallet.id,
                      })) ?? [],
                    hidden: watchType !== TransactionType.TRANSFER,
                    errorMessage: walletErrorMessage,
                  },
                  amount: {
                    placeholder: "5,000",
                    label: "Amount",
                    max: 1_000_000_000_000,
                    errorMessage: amountErrorMessage,
                    currency: "₱",
                    sign: watchType === TransactionType.INCOME ? Plus : Minus,
                  },
                  description: {
                    placeholder: "Birthday Celebration",
                    label: "Description",
                    type: "textarea",
                  },
                  date: {
                    label: "Date",
                    defaultNow: true,
                  },
                }}
                defaultValues={defaultValues}
                renderAfter={() => (
                  <Button
                    className="mt-4 w-full"
                    isLoading={createTransaction.isLoading}
                    type="submit"
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
          wallet={wallet.data}
          walletsExcludingSelf={walletFilterOptions}
        />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default WalletDetails;
