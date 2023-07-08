import { type NextPage } from "next";
import { WalletItem } from "../../components/wallet/WalletItem";
import { Button } from "../../components/ui/Button";
import { trpc } from "../../utils/trpc";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { Plus } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import { WalletSkeleton } from "../../components/wallet/WalletSkeleton";
import { WalletForm } from "../../components/wallet/WalletForm";

const Wallets: NextPage = () => {
  const { data, isLoading, isFetching } = trpc.wallet.getAll.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold">Wallets</h2>
          {isFetching && !isLoading && <Spinner />}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button icon={Plus}>Add</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Wallet</DialogTitle>
            </DialogHeader>

            <WalletForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        {data?.map((wallet) => {
          return <WalletItem key={wallet.id} wallet={wallet} />;
        })}

        {isLoading &&
          Array(6)
            .fill(0)
            .map((_, i) => <WalletSkeleton key={i} />)}
      </div>
    </div>
  );
};

export default Wallets;
