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
import { TransactionTable } from "../../components/transaction/TransactionTable";
import { type LabelValuePair } from "../../components/form/SelectInput";
import { ArrowLeftRight } from "lucide-react";
import { GuapActions } from "../../components/guap/GuapActions";
import { Spinner } from "../../components/ui/Spinner";

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
  const { data: transactionsData, isFetching: transactionsFetching } =
    trpc.transaction.getTransactionsByGuap.useQuery(
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
    if (guap.data?.balance !== null && guap.data?.balance !== undefined) {
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

  const guapFilterOptions: LabelValuePair[] =
    guaps.data?.map((g) => ({
      label: g.name,
      value: g.id,
    })) ?? [];
  const externalGuapFilterOptions: LabelValuePair[] =
    externalGuaps.data?.map((g) => ({
      label: g.name,
      value: g.id,
    })) ?? [];

  return guap.data ? (
    <div>
      <div className="mb-12 flex justify-between gap-8">
        <div>
          <p className="text-sm text-muted-foreground">Balance</p>
          <h1 className="mb-2 text-4xl font-extrabold text-highlight">
            &#8369; <span>{numeral(guap.data.balance).format("0,0")}</span>
            <span className="text-lg">
              {numeral(guap.data.balance).format(".00")}
            </span>
          </h1>
          <h2 className="text-xl font-semibold">{guap.data.name}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {guap.data.description}
          </p>
        </div>

        <div className="flex gap-2">
          <GuapActions guap={guap.data} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg text-muted-foreground">
              Transaction History
            </h3>
            {transactionsFetching && <Spinner />}
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              form.reset(defaultValues);
              resetErrorMessages();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" icon={ArrowLeftRight}>
                Create Transaction
              </Button>
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
                    currency: "₱",
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
                  <Button
                    className="mt-4 w-full"
                    isLoading={createTransaction.isLoading}
                    type="submit"
                    onClick={() => {
                      setGuapIdErrors();
                    }}
                  >
                    Save
                  </Button>
                )}
              />
            </DialogContent>
          </Dialog>
        </div>

        <TransactionTable
          transactions={transactionsData ?? []}
          guapId={id as string}
          guaps={guapFilterOptions.concat(externalGuapFilterOptions)}
        />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default GuapDetails;
