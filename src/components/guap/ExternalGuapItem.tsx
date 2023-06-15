import { useState } from "react";
import { externalGuapSchema, Form } from "../form/Form";
import { trpc } from "../../utils/trpc";
import { type z } from "zod";
import { Button } from "../ui/Button";
import { mapEnumToLabelValuePair } from "../../utils";
import { withId } from "../../types/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { Pencil, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/AlertDialog";
import {
  type ExternalGuap,
  ExternalGuapType,
} from "../../server/db/schema/guaps";

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
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{externalGuap.name}</h3>

        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger>
              <Pencil className="cursor-pointer" />
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
                    <Button isLoading={editGuap.isLoading}>
                      {editGuap.isLoading ? "Saving" : "Save"}
                    </Button>
                  </div>
                )}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger>
              <Trash className="cursor-pointer" />
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

                <AlertDialogAction
                  onClick={() => deleteGuap.mutate({ id: externalGuap.id })}
                  isLoading={deleteGuap.isLoading}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <p className="text-gray-400">{externalGuap.description}</p>
    </div>
  );
};
