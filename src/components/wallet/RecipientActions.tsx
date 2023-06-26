import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogDescription,
} from "../ui/AlertDialog";
import { Pencil, Trash } from "lucide-react";
import { withId } from "../../types/zod";
import type { Recipient } from "./RecipientTable";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { Button } from "../ui/Button";
import { trpc } from "../../utils/trpc";
import { Form, recipientSchema } from "../form/Form";
import { RecipientType } from "../../server/db/schema/wallets";
import { mapEnumToLabelValuePair } from "../../utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import type { z } from "zod";

interface RecipientActionsProps {
  recipient: Recipient;
}

export const RecipientActions: React.FC<RecipientActionsProps> = ({
  recipient,
}) => {
  const utils = trpc.useContext();

  const editRecipient = trpc.recipient.edit.useMutation({
    onSuccess: () => {
      utils.recipient.getAll.invalidate();
    },
  });
  const deleteRecipient = trpc.recipient.delete.useMutation({
    onSuccess: () => {
      utils.recipient.getAll.invalidate();
    },
  });
  const editRecipientSchema = recipientSchema.merge(withId);

  const onSubmit = (data: z.infer<typeof editRecipientSchema>) => {
    editRecipient.mutate(data);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex w-full items-center">
              <Pencil className="mr-2" />
              <span>Edit</span>
            </div>
          </DropdownMenuItem>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recipient</DialogTitle>
          </DialogHeader>

          <Form
            schema={editRecipientSchema}
            onSubmit={onSubmit}
            props={{
              name: {
                placeholder: "Mama BPI Savings Account",
                label: "Name",
              },
              description: {
                placeholder: "Mama's Main Savings Account",
                label: "Description",
              },
              id: {
                type: "hidden",
              },
              type: {
                options: mapEnumToLabelValuePair(RecipientType),
                label: "Type",
                hidden: true,
              },
            }}
            defaultValues={{
              name: recipient.name,
              description: recipient.description ?? undefined,
              id: recipient.id,
              type: recipient.type,
            }}
            renderAfter={() => (
              <div className="mt-4 flex justify-end">
                <Button isLoading={editRecipient.isLoading}>Save</Button>
              </div>
            )}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex w-full items-center text-destructive">
              <Trash className="mr-2" />
              <span>Delete</span>
            </div>
          </DropdownMenuItem>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {recipient.type.toLowerCase()}?
            </AlertDialogTitle>
            Are you sure you want to delete this {recipient.type.toLowerCase()}?
            This action cannot be undone
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={() => deleteRecipient.mutate({ id: recipient.id })}
              isLoading={deleteRecipient.isLoading}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
