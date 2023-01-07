import { type Guap } from "@prisma/client";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Dialog } from "../primitives/Dialog";
import { Form } from "../form/Form";
import { trpc } from "../../utils/trpc";
import { guap as guapSchema, withId } from "../../types/zod";
import { type z } from "zod";
import { Button } from "../ui/Button";
import { AlertDialog } from "../primitives/AlertDialog";
import numeral from "numeral";

interface GuapItemProps {
  guap: Guap;
}

export const GuapItem: React.FC<GuapItemProps> = ({ guap }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const editGuap = trpc.guap.edit.useMutation({
    onSuccess: () => {
      utils.guap.getAll.invalidate();
    },
  });
  const deleteGuap = trpc.guap.delete.useMutation({
    onSuccess: () => {
      utils.guap.getAll.invalidate();
      setIsDeleteDialogOpen(false);
    },
  });
  const utils = trpc.useContext();
  const editGuapSchema = guapSchema.merge(withId);

  const onSubmit = (data: z.infer<typeof editGuapSchema>) => {
    editGuap.mutate(data);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="w-40 basis-[30%] rounded-md p-4 shadow-md">
      <div className="flex items-center justify-between">
        <strong>&#8369; {numeral(guap.balance).format("0,0.00")}</strong>
        <div className="flex gap-2">
          <Dialog
            openButton={<Pencil1Icon className="cursor-pointer" />}
            title="Edit Guap"
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
          >
            <Form
              schema={editGuapSchema}
              onSubmit={onSubmit}
              props={{
                name: {
                  placeholder: "BPI Savings Account",
                  label: "Name",
                },
                description: {
                  placeholder: "Main Savings Account",
                  label: "Description",
                },
                balance: {
                  placeholder: "5000",
                  label: "Balance",
                },
                id: {
                  type: "hidden",
                },
              }}
              defaultValues={{
                name: guap.name,
                description: guap.description,
                balance: guap.balance,
                id: guap.id,
              }}
              renderAfter={() => (
                <div className="mt-4 flex justify-end">
                  <Button isLoading={editGuap.isLoading}>
                    {editGuap.isLoading ? "Saving" : "Save"}
                  </Button>
                </div>
              )}
            />
          </Dialog>

          <AlertDialog
            openButton={<TrashIcon className="cursor-pointer" />}
            onConfirm={() => {
              deleteGuap.mutate({ id: guap.id });
            }}
            isLoading={deleteGuap.isLoading}
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            title="Delete Guap?"
            description="Are you sure you want to delete this guap? This action cannot be undone"
            confirmText="Delete"
            loadingConfirmText="Deleting"
          />
        </div>
      </div>
      <h3 className="font-semibold">{guap.name}</h3>
      <p className="text-gray-400">{guap.description}</p>
    </div>
  );
};
