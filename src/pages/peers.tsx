import { type NextPage } from "next";
import { useState } from "react";
import { externalGuapSchema, Form } from "../components/form/Form";
import { ExternalGuapItem } from "../components/guap/ExternalGuapItem";
import { Button } from "../components/ui/Button";
import { trpc } from "../utils/trpc";
import { type z } from "zod";
import { mapEnumToLabelValuePair } from "../utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import { ExternalGuapType } from "../server/db/schema/guaps";

const Peers: NextPage = () => {
  const utils = trpc.useContext();
  const peers = trpc.externalGuap.getAllPeers.useQuery();
  const createPeer = trpc.externalGuap.create.useMutation({
    onSuccess: () => {
      utils.externalGuap.getAllPeers.invalidate();
      setIsOpen(false);
    },
  });
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (data: z.infer<typeof externalGuapSchema>) => {
    createPeer.mutate({ ...data, type: data.type as ExternalGuapType });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Peers</h2>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Peer</DialogTitle>
            </DialogHeader>

            <Form
              schema={externalGuapSchema}
              onSubmit={onSubmit}
              props={{
                name: {
                  placeholder: "Mama's BPI Savings Account",
                  label: "Name",
                },
                description: {
                  placeholder: "Mama's Main Savings Account",
                  label: "Description",
                  type: "textarea",
                },
                type: {
                  options: mapEnumToLabelValuePair(ExternalGuapType),
                  label: "Type",
                  hidden: true,
                },
              }}
              defaultValues={{
                type: ExternalGuapType.PEER,
              }}
              renderAfter={() => (
                <div className="mt-4 flex justify-end">
                  <Button isLoading={createPeer.isLoading} type="submit">
                    {createPeer.isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        {peers.data?.map((peer) => {
          return <ExternalGuapItem key={peer.id} externalGuap={peer} />;
        })}
      </div>
    </div>
  );
};

export default Peers;
