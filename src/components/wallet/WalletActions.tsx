import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { withId, wallet as walletSchema } from "../../types/zod";
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
import { Form } from "../form/Form";
import { useRouter } from "next/router";

interface WalletActionsProps {
  wallet: Wallet;
}

export const WalletActions: React.FC<WalletActionsProps> = ({ wallet }) => {
  const utils = trpc.useContext();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const editWallet = trpc.wallet.edit.useMutation({
    onSuccess: () => {
      utils.wallet.getAll.invalidate();
      utils.wallet.getOne.invalidate({ id: wallet.id });
      setIsEditDialogOpen(false);
    },
  });
  const deleteWallet = trpc.wallet.delete.useMutation({
    onSuccess: () => {
      utils.wallet.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      router.replace("/wallets");
    },
  });
  const editWalletSchema = walletSchema.merge(withId);

  const onEditSubmit = (data: z.infer<typeof editWalletSchema>) => {
    editWallet.mutate(data);
  };

  return (
    <>
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

          <Form
            schema={editWalletSchema}
            onSubmit={onEditSubmit}
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
              id: {
                type: "hidden",
              },
            }}
            defaultValues={{
              name: wallet.name,
              description: wallet.description ?? undefined,
              balance: wallet.balance ?? undefined,
              id: wallet.id,
            }}
            renderAfter={() => (
              <Button className="w-full" isLoading={editWallet.isLoading}>
                Save
              </Button>
            )}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <Button variant="secondary" icon={Trash}>
            Delete
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Walelt?</AlertDialogTitle>
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
    </>
  );
};
