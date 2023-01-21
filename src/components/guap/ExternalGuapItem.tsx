import { ExternalGuapType, type ExternalGuap } from "@prisma/client";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Dialog } from "../primitives/Dialog";
import { externalGuapSchema, Form } from "../form/Form";
import { trpc } from "../../utils/trpc";
import { type z } from "zod";
import { Button } from "../ui/Button";
import { AlertDialog } from "../primitives/AlertDialog";
import { mapEnumToLabelValuePair } from "../../utils";
import { withId } from "../../types/zod";

interface ExternalGuapItemProps {
  externalGuap: ExternalGuap;
}

export const ExternalGuapItem: React.FC<ExternalGuapItemProps> = ({
  externalGuap,
}) => {
  const utils = trpc.useContext();
  const utilsGetProcedure =
    externalGuap.type === ExternalGuapType.BILLER
      ? utils.externalGuap.getAllBillers
      : utils.externalGuap.getAllPeers;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const editGuap = trpc.externalGuap.edit.useMutation({
    onSuccess: () => {
      utilsGetProcedure.invalidate();
    },
  });
  const deleteGuap = trpc.externalGuap.delete.useMutation({
    onSuccess: () => {
      utilsGetProcedure.invalidate();
      setIsDeleteDialogOpen(false);
    },
  });
  const editExternalGuapSchema = externalGuapSchema.merge(withId);

  const onSubmit = (data: z.infer<typeof editExternalGuapSchema>) => {
    editGuap.mutate(data);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="w-40 basis-[30%] rounded-md p-4 shadow-md">
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Dialog
            openButton={<Pencil1Icon className="cursor-pointer" />}
            title="Edit Guap"
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
          >
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
                description: externalGuap.description,
                id: externalGuap.id,
                type: externalGuap.type,
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
              deleteGuap.mutate({ id: externalGuap.id });
            }}
            isLoading={deleteGuap.isLoading}
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            title={`Delete ${externalGuap.type.toLowerCase()}?`}
            description={`Are you sure you want to delete this ${externalGuap.type.toLowerCase()}? This action cannot be undone`}
            confirmText="Delete"
            loadingConfirmText="Deleting"
          />
        </div>
      </div>
      <h3 className="font-semibold">{externalGuap.name}</h3>
      <p className="text-gray-400">{externalGuap.description}</p>
    </div>
  );
};
