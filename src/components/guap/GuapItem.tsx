import { useState } from "react";
import { Form } from "../form/Form";
import { trpc } from "../../utils/trpc";
import { externalGuap, guap as guapSchema, withId } from "../../types/zod";
import { type z } from "zod";
import { Button } from "../ui/Button";
import numeral from "numeral";
import Link from "next/link";
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
import { type Guap } from "../../server/db/schema/guaps";

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
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger>
              <Pencil className="cursor-pointer" />
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Guap</DialogTitle>
              </DialogHeader>

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
                    type: "textarea",
                  },
                  balance: {
                    placeholder: "5,000",
                    label: "Balance",
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
                <AlertDialogTitle>Delete Guap?</AlertDialogTitle>
                Are you sure you want to delete this guap? This action cannot be
                undone
                <AlertDialogDescription></AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  onClick={() => deleteGuap.mutate({ id: guap.id })}
                  isLoading={deleteGuap.isLoading}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Link href={`/guaps/${guap.id}`}>
        <h3 className="font-semibold">{guap.name}</h3>
      </Link>
      <p className="text-gray-400">{guap.description}</p>
    </div>
  );
};
