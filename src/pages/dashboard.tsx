import { type NextPage } from "next";
import { TransactionTable } from "../components/transaction/TransactionTable";
import { trpc } from "../utils/trpc";
import { Spinner } from "../components/ui/Spinner";
import { TransactionForm } from "../components/transaction/TransactionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useState } from "react";
import numeral from "numeral";

const Dashboard: NextPage = () => {
  const { data: transactionsData, isFetching: transactionsFetching } =
    trpc.transaction.getAllTransactions.useQuery();
  const { data: walletsData } = trpc.wallet.getAll.useQuery();
  const { data: totalBalanceData } = trpc.wallet.getTotalBalance.useQuery();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold">Dashboard</h2>

      <div>
        <p className="text-sm text-muted-foreground">Total Balance</p>
        <h1 className="mb-2 text-4xl font-extrabold text-highlight">
          &#8369;{" "}
          <span>
            {numeral(totalBalanceData?.totalBalance).format("0,0", Math.floor)}
          </span>
          <span className="text-lg">
            {numeral(totalBalanceData?.totalBalance).format(".00")}
          </span>
        </h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg text-muted-foreground">Transaction History</h3>
          {transactionsFetching && <Spinner />}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
              wallets={walletsData ?? []}
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <TransactionTable
        transactions={transactionsData ?? []}
        wallets={walletsData ?? []}
      />
    </div>
  );
};

export default Dashboard;
