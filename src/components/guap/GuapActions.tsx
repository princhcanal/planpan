import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { withId, guap as guapSchema } from "../../types/zod";
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
import type { Guap } from "../../server/db/schema/guaps";
import { Form } from "../form/Form";
import { useRouter } from "next/router";

interface GuapActionsProps {
  guap: Guap;
}

export const GuapActions: React.FC<GuapActionsProps> = ({ guap }) => {
  const utils = trpc.useContext();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const editGuap = trpc.guap.edit.useMutation({
    onSuccess: () => {
      utils.guap.getAll.invalidate();
      utils.guap.getOne.invalidate({ id: guap.id });
      setIsEditDialogOpen(false);
    },
  });
  const deleteGuap = trpc.guap.delete.useMutation({
    onSuccess: () => {
      utils.guap.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      router.replace("/guaps");
    },
  });
  const editGuapSchema = guapSchema.merge(withId);

  const onEditSubmit = (data: z.infer<typeof editGuapSchema>) => {
    editGuap.mutate(data);
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
            <DialogTitle>Edit Guap</DialogTitle>
          </DialogHeader>

          <Form
            schema={editGuapSchema}
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
              name: guap.name,
              description: guap.description ?? undefined,
              balance: guap.balance ?? undefined,
              id: guap.id,
            }}
            renderAfter={() => (
              <Button className="w-full" isLoading={editGuap.isLoading}>
                {editGuap.isLoading ? "Saving" : "Save"}
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
            <AlertDialogTitle>Delete Guap?</AlertDialogTitle>
            Are you sure you want to delete this guap? This action cannot be
            undone
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={() => deleteGuap.mutate({ id: guap.id })}
              isLoading={deleteGuap.isLoading}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
