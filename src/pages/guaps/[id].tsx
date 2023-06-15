import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type z } from "zod";
import { Form } from "../../components/form/Form";
import { Button } from "../../components/ui/Button";
import { trpc } from "../../utils/trpc";
import numeral from "numeral";
import { mapEnumToLabelValuePair } from "../../utils";
import { useForm } from "react-hook-form";
import { TransactionItem } from "../../components/transaction/TransactionItem";
import {
  transaction,
  transactionRefine,
  transactionRefineMessage,
} from "../../types/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { TransactionType } from "../../server/db/schema/transactions";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const transactionSchema = transaction.refine(
    transactionRefine,
    transactionRefineMessage
  );
  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    if (guap.data?.balance) {
      if (
        watchAmount > guap.data.balance &&
        watchType === TransactionType.OUTGOING
      ) {
      } else {
        createTransaction.mutate(data);
      }
    }
  };

  const form = useForm<z.infer<typeof transactionSchema>>();

  const defaultValues = {
    type: TransactionType.OUTGOING,
    guapId: guap.data?.id,
    sendToGuap: false,
  };

  const watchType = form.watch("type");
  const watchSendToGuap = form.watch("sendToGuap");
  const watchAmount = form.watch("amount");
  const watchExternalGuapId = form.watch("externalGuapId");
  const watchInternalGuapId = form.watch("internalGuapId");

  const [amountErrorMessage, setAmountErrorMessage] = useState("");
  const [guapErrorMessage, setGuapErrorMessage] = useState("");

  useEffect(() => {
    if (watchType === TransactionType.INCOMING) {
      form.resetField("sendToGuap", { defaultValue: false });
      form.resetField("internalGuapId", {
        defaultValue: undefined,
      });
    }
  }, [watchType, form]);

  useEffect(() => {
    form.resetField("externalGuapId", {
      defaultValue: undefined,
    });
    form.resetField("internalGuapId", {
      defaultValue: undefined,
    });
  }, [watchSendToGuap, form]);

  useEffect(() => {
    if (guap.data?.balance) {
      if (
        watchAmount > guap.data.balance &&
        watchType === TransactionType.OUTGOING
      ) {
        setAmountErrorMessage(
          `Not enough balance (₱ ${numeral(guap.data.balance).format(
            "0,0.00"
          )})`
        );
      } else {
        setAmountErrorMessage("");
      }
    }
  }, [watchAmount, watchType, form, guap.data?.balance]);

  useEffect(() => {
    if (!!watchExternalGuapId || !!watchInternalGuapId) {
      setGuapErrorMessage("");
    }
  }, [watchExternalGuapId, watchInternalGuapId]);

  const setGuapIdErrors = () => {
    if (!watchExternalGuapId && !watchInternalGuapId) {
      setGuapErrorMessage("Must choose either Guap or Peer/Biller");
    }
  };

  const resetErrorMessages = () => {
    setGuapErrorMessage("");
    setAmountErrorMessage("");
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold">{guap.data?.name}</h2>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            form.reset(defaultValues);
            resetErrorMessages();
          }}
        >
          <DialogTrigger>
            {mounted && <Button>Create Transaction</Button>}
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Transaction</DialogTitle>
            </DialogHeader>

            <Form
              form={form}
              schema={transactionSchema}
              onSubmit={onSubmit}
              props={{
                guapId: {
                  type: "hidden",
                },
                type: {
                  options: mapEnumToLabelValuePair(TransactionType),
                  label: "Type",
                },
                internalGuapId: {
                  label: "Send To",
                  placeholder: "Choose Guap",
                  options:
                    guapsExcludingSelf?.map((guap) => ({
                      label: guap.name,
                      value: guap.id,
                    })) ?? [],
                  hidden: !watchSendToGuap,
                  errorMessage: guapErrorMessage,
                },
                externalGuapId: {
                  label: "Send To",
                  placeholder: "Choose Peer/Biller",
                  options:
                    externalGuaps.data?.map((guap) => ({
                      label: guap.name,
                      value: guap.id,
                    })) ?? [],
                  hidden: watchSendToGuap ?? false,
                  errorMessage: guapErrorMessage,
                },
                sendToGuap: {
                  text: "Send to guap?",
                  disabled: watchType === TransactionType.INCOMING,
                },
                amount: {
                  placeholder: "5,000",
                  label: "Amount",
                  max: 1_000_000_000_000,
                  errorMessage: amountErrorMessage,
                },
                description: {
                  placeholder: "Groceries",
                  label: "Description",
                  type: "textarea",
                },
                date: {
                  label: "Date",
                },
              }}
              defaultValues={defaultValues}
              renderAfter={() => (
                <div className="mt-4 flex justify-end">
                  <Button
                    isLoading={createTransaction.isLoading}
                    type="submit"
                    onClick={() => {
                      setGuapIdErrors();
                    }}
                  >
                    {createTransaction.isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            />
          </DialogContent>
        </Dialog>
      </div>
      <h2 className="mb-4 text-2xl font-semibold text-indigo-500">
        &#8369; {numeral(guap.data?.balance).format("0,0.00")}
      </h2>
      <h2 className="mb-4 text-2xl font-semibold">Transaction History</h2>
      {transactions.data?.map((transaction) => (
        <TransactionItem
          transaction={transaction.transactions}
          guap={transaction.guaps}
          internalGuap={transaction.internalGuap}
          externalGuap={transaction.externalGuap}
          key={transaction.transactions.id}
          guapId={id as string}
        />
      ))}
    </div>
  );
};

export default GuapDetails;
