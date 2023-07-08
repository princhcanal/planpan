import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/AlertDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import type { Wallet } from "../../server/db/schema/wallets";
import { useRouter } from "next/router";
import { WalletForm } from "./WalletForm";

interface WalletActionsProps {
  wallet: Wallet;
}

export const WalletActions: React.FC<WalletActionsProps> = ({ wallet }) => {
  const utils = trpc.useContext();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteWallet = trpc.wallet.delete.useMutation({
    onSuccess: () => {
      utils.wallet.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      router.replace("/wallets");
    },
  });

  return (
    <div className="flex gap-2">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" icon={Pencil}>
            Edit
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Wallet</DialogTitle>
          </DialogHeader>

          <WalletForm
            existingWallet={wallet}
            onSuccess={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <Button variant="secondary" className="text-destructive" icon={Trash}>
            Delete
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wallet?</AlertDialogTitle>
            Are you sure you want to delete this wallet? This action cannot be
            undone
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={() => deleteWallet.mutate({ id: wallet.id })}
              isLoading={deleteWallet.isLoading}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
