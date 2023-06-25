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
import type { ExternalGuap } from "./ExternalGuapTable";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { Button } from "../ui/Button";
import { trpc } from "../../utils/trpc";
import { Form, externalGuapSchema } from "../form/Form";
import { ExternalGuapType } from "../../server/db/schema/guaps";
import { mapEnumToLabelValuePair } from "../../utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import type { z } from "zod";

interface ExternalGuapActionsProps {
  externalGuap: ExternalGuap;
}

export const ExternalGuapActions: React.FC<ExternalGuapActionsProps> = ({
  externalGuap,
}) => {
  const utils = trpc.useContext();

  const editGuap = trpc.externalGuap.edit.useMutation({
    onSuccess: () => {
      utils.externalGuap.getAll.invalidate();
    },
  });
  const deleteGuap = trpc.externalGuap.delete.useMutation({
    onSuccess: () => {
      utils.externalGuap.getAll.invalidate();
    },
  });
  const editExternalGuapSchema = externalGuapSchema.merge(withId);

  const onSubmit = (data: z.infer<typeof editExternalGuapSchema>) => {
    editGuap.mutate(data);
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
            <DialogTitle>Edit Guap</DialogTitle>
          </DialogHeader>

          <Form
            schema={editExternalGuapSchema}
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
                options: mapEnumToLabelValuePair(ExternalGuapType),
                label: "Type",
                hidden: true,
              },
            }}
            defaultValues={{
              name: externalGuap.name,
              description: externalGuap.description ?? undefined,
              id: externalGuap.id,
              type: externalGuap.type,
            }}
            renderAfter={() => (
              <div className="mt-4 flex justify-end">
                <Button isLoading={editGuap.isLoading}>Save</Button>
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
              Delete {externalGuap.type.toLowerCase()}?
            </AlertDialogTitle>
            Are you sure you want to delete this{" "}
            {externalGuap.type.toLowerCase()}? This action cannot be undone
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={() => deleteGuap.mutate({ id: externalGuap.id })}
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
