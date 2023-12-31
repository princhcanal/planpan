import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { type RouterOutputs, trpc } from "../../utils/trpc";
import numeral from "numeral";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { TransactionTable } from "../../components/transaction/TransactionTable";
import { ArrowLeftRight, Wallet } from "lucide-react";
import { WalletActions } from "../../components/wallet/WalletActions";
import { Spinner } from "../../components/ui/Spinner";
import { TransactionForm } from "../../components/transaction/TransactionForm";
import { WalletTypeIcon } from "../../components/wallet/WalletTypeIcon";
import type {
  PaymentNetwork,
  WalletType,
} from "../../server/db/schema/wallets";
import { PaymentNetworkIcon } from "../../components/wallet/PaymentNetworkIcon";

export type Wallet = RouterOutputs["wallet"]["getAll"][number];

const WalletDetails: NextPage = () => {
  const {
    query: { id },
  } = useRouter();
  const wallets = trpc.wallet.getAll.useQuery();
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return wallet.data ? (
    <div>
      <div className="mb-12 flex flex-col justify-between gap-8 sm:flex-row">
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

        <div className="flex flex-col gap-2">
          <div className="mb-2">
            <WalletActions wallet={wallet.data} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <WalletTypeIcon walletType={wallet.data.type as WalletType} />

            {wallet.data.paymentNetwork && (
              <div className="flex items-center gap-2">
                <PaymentNetworkIcon
                  paymentNetwork={wallet.data.paymentNetwork as PaymentNetwork}
                />
              </div>
            )}
          </div>
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
            onOpenChange={setIsCreateDialogOpen}
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

              <TransactionForm
                walletId={wallet.data.id}
                wallets={wallets.data ?? []}
                onSuccess={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <TransactionTable
          transactions={transactionsData ?? []}
          wallet={wallet.data}
          wallets={wallets.data ?? []}
        />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default WalletDetails;
