import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { Spinner } from "../../components/ui/Spinner";
import { RecipientTable } from "../../components/wallet/RecipientTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { Plus } from "lucide-react";
import { Form, recipientSchema } from "../../components/form/Form";
import { Button } from "../../components/ui/Button";
import { useState } from "react";
import type { z } from "zod";
import { RecipientType } from "../../server/db/schema/wallets";
import { mapEnumToLabelValuePair } from "../../utils";

const Recipients: NextPage = () => {
  const utils = trpc.useContext();
  const { data, isLoading, isFetching } = trpc.recipient.getAll.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const createPeerBiller = trpc.recipient.create.useMutation({
    onSuccess: () => {
      utils.recipient.getAll.invalidate();
      setIsOpen(false);
    },
  });

  const onSubmit = (data: z.infer<typeof recipientSchema>) => {
    createPeerBiller.mutate({ ...data, type: data.type as RecipientType });
  };

  const defaultValues = {
    type: RecipientType.PEER,
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold">Recipients</h2>
          {isFetching && !isLoading && <Spinner />}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button icon={Plus}>Add</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Recipient</DialogTitle>
            </DialogHeader>

            <Form
              schema={recipientSchema}
              onSubmit={onSubmit}
              props={{
                name: {
                  placeholder: "PLDT Home",
                  label: "Name",
                },
                description: {
                  placeholder: "Account No. 123456789",
                  label: "Description",
                  type: "textarea",
                },
                type: {
                  options: mapEnumToLabelValuePair(RecipientType),
                  label: "Type",
                },
              }}
              renderAfter={() => (
                <Button
                  className="mt-4 w-full"
                  isLoading={createPeerBiller.isLoading}
                  type="submit"
                >
                  Save
                </Button>
              )}
              defaultValues={defaultValues}
            />
          </DialogContent>
        </Dialog>
      </div>

      {data && <RecipientTable recipients={data} />}
    </div>
  );
};

export default Recipients;
