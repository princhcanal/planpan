import { TransactionType } from "@prisma/client";
import { TrashIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";
import {
  dateStringSchema,
  entitySelectSchema,
  Form,
  transactionTypeSchema,
} from "../../components/form/Form";
import { AlertDialog } from "../../components/primitives/AlertDialog";
import { Dialog } from "../../components/primitives/Dialog";
import { Button } from "../../components/ui/Button";
import { trpc } from "../../utils/trpc";
import numeral from "numeral";
import { mapEnumToLabelValuePair } from "../../utils";
import { useForm } from "react-hook-form";

const GuapDetails: NextPage = () => {
  const {
    query: { id },
  } = useRouter();
  const utils = trpc.useContext();
  const guaps = trpc.guap.getAll.useQuery();
  const guapsExcludingSelf = guaps.data?.filter((guap) => guap.id !== id);
  const externalGuaps = trpc.externalGuap.getAll.useQuery();
  const guap = trpc.guap.getOne.useQuery(
    { id: id as string },
    { enabled: !!id }
  );
  const transactions = trpc.transaction.getTransactionsByGuap.useQuery(
    {
      id: id as string,
    },
    { enabled: !!id }
  );
  const createTransaction = trpc.transaction.createTransaction.useMutation({
    onSuccess: () => {
      utils.guap.getOne.invalidate({ id: id as string });
      utils.transaction.getTransactionsByGuap.invalidate({
        id: id as string,
      });
      setIsCreateDialogOpen(false);
    },
  });
  const deleteTransaction = trpc.transaction.deleteTransaction.useMutation({
    onSuccess: () => {
      utils.guap.getOne.invalidate({ id: id as string });
      utils.transaction.getTransactionsByGuap.invalidate({
        id: id as string,
      });
      setIsDeleteDialogOpen(false);
    },
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sendToGuap, setSendToGuap] = useState(false);

  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    createTransaction.mutate({
      ...data,
      type: data.type as TransactionType,
    });
  };

  const transactionSchema = z
    .object({
      externalGuapId: entitySelectSchema,
      internalGuapId: entitySelectSchema,
      sendToGuap: z.boolean(),
      guapId: z.string().cuid(),
      type: transactionTypeSchema,
      amount: z
        .number()
        .positive()
        .max(guap.data?.balance ?? 0, "Not enough balance"),
      description: z.string().nullish(),
      date: dateStringSchema,
    })
    .refine(
      (data) =>
        (!!data.internalGuapId && !data.externalGuapId) ||
        (!data.internalGuapId && !!data.externalGuapId),
      {
        message: "Either Guap or Peer/Biller required",
      }
    );

  const form = useForm<z.infer<typeof transactionSchema>>();

  const defaultValues = {
    type: TransactionType.OUTGOING,
    guapId: guap.data?.id,
    date: new Date().toISOString(),
    sendToGuap: false,
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold">{guap.data?.name}</h2>
        <Dialog
          openButton={<Button>Create Transaction</Button>}
          title="Create Transaction"
          isOpen={isCreateDialogOpen}
          setIsOpen={(open) => {
            setIsCreateDialogOpen(open);
            if (!open.valueOf()) {
              setSendToGuap(false);
            }
            form.reset(defaultValues);
          }}
        >
          <Form
            form={form}
            schema={transactionSchema}
            onSubmit={onSubmit}
            props={{
              description: {
                placeholder: "Groceries",
                label: "Description",
                type: "textarea",
              },
              amount: {
                placeholder: "5,000",
                label: "Amount",
                max: guap.data?.balance,
              },
              date: {
                label: "Date",
                hidden: true,
              },
              guapId: {
                type: "hidden",
              },
              type: {
                options: mapEnumToLabelValuePair(TransactionType),
                label: "Type",
                hidden: true,
              },
              sendToGuap: {
                text: "Send to guap?",
                onChange: (checked: boolean) => {
                  setSendToGuap(checked);
                  form.resetField("externalGuapId", {
                    defaultValue: undefined,
                  });
                  form.resetField("internalGuapId", {
                    defaultValue: undefined,
                  });
                },
              },
              internalGuapId: {
                label: "Send To",
                placeholder: "Choose Guap",
                options:
                  guapsExcludingSelf?.map((guap) => ({
                    label: guap.name,
                    value: guap.id,
                  })) ?? [],
                hidden: !sendToGuap,
              },
              externalGuapId: {
                label: "Send To",
                placeholder: "Choose Peer/Biller",
                options:
                  externalGuaps.data?.map((guap) => ({
                    label: guap.name,
                    value: guap.id,
                  })) ?? [],
                hidden: sendToGuap,
              },
            }}
            defaultValues={defaultValues}
            renderAfter={() => (
              <div className="mt-4 flex justify-end">
                <Button
                  isLoading={createTransaction.isLoading}
                  type="submit"
                  onClick={() => {
                    form.clearErrors();
                  }}
                >
                  {createTransaction.isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          />
        </Dialog>
      </div>

      <h2 className="mb-4 text-2xl font-semibold text-indigo-500">
        Balance: &#8369; {numeral(guap.data?.balance).format("0,0.00")}
      </h2>

      <h2 className="mb-4 text-2xl font-semibold">Transaction History</h2>

      {transactions.data?.map((transaction) => {
        return (
          <div
            key={transaction.id}
            className="mb-4 rounded-md border border-black p-2"
          >
            <p>Amount: {transaction.amount}</p>
            <p>Description: {transaction.description}</p>
            <p>Date: {transaction.date.toDateString()}</p>
            <p>Sent To: {transaction.externalGuap?.name}</p>
            <AlertDialog
              openButton={<TrashIcon className="cursor-pointer" />}
              onConfirm={() => {
                deleteTransaction.mutate({
                  ...transaction,
                  date: transaction.date.toISOString(),
                });
              }}
              isLoading={deleteTransaction.isLoading}
              isOpen={isDeleteDialogOpen}
              setIsOpen={setIsDeleteDialogOpen}
              title="Delete Transaction?"
              description="Are you sure you want to delete this transaction? This action cannot be undone"
              confirmText="Delete"
              loadingConfirmText="Deleting"
            />
          </div>
        );
      })}
    </div>
  );
};

export default GuapDetails;
