import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { Spinner } from "../../components/ui/Spinner";
import { ExternalGuapTable } from "../../components/guap/ExternalGuapTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { Plus } from "lucide-react";
import { Form, externalGuapSchema } from "../../components/form/Form";
import { Button } from "../../components/ui/Button";
import { useState } from "react";
import type { z } from "zod";
import { ExternalGuapType } from "../../server/db/schema/guaps";
import { mapEnumToLabelValuePair } from "../../utils";

const PeersAndBillers: NextPage = () => {
  const utils = trpc.useContext();
  const { data, isLoading, isFetching } = trpc.externalGuap.getAll.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const createPeerBiller = trpc.externalGuap.create.useMutation({
    onSuccess: () => {
      utils.externalGuap.getAll.invalidate();
      setIsOpen(false);
    },
  });

  const onSubmit = (data: z.infer<typeof externalGuapSchema>) => {
    createPeerBiller.mutate({ ...data, type: data.type as ExternalGuapType });
  };

  const defaultValues = {
    type: ExternalGuapType.PEER,
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold">Peers & Billers</h2>
          {isFetching && !isLoading && <Spinner />}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button icon={Plus}>Add</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Guap</DialogTitle>
            </DialogHeader>

            <Form
              schema={externalGuapSchema}
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
                type: {
                  options: mapEnumToLabelValuePair(ExternalGuapType),
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

      {data && <ExternalGuapTable externalGuaps={data} />}
    </div>
  );
};

export default PeersAndBillers;
