import { ExternalGuapType } from "@prisma/client";
import { type NextPage } from "next";
import { useState } from "react";
import { externalGuapSchema, Form } from "../components/form/Form";
import { ExternalGuapItem } from "../components/guap/ExternalGuapItem";
import { Dialog } from "../components/primitives/Dialog";
import { Button } from "../components/ui/Button";
import { trpc } from "../utils/trpc";
import { type z } from "zod";
import { mapEnumToLabelValuePair } from "../utils";

const Billers: NextPage = () => {
  const utils = trpc.useContext();
  const billers = trpc.externalGuap.getAllBillers.useQuery();
  const createBiller = trpc.externalGuap.create.useMutation({
    onSuccess: () => {
      utils.externalGuap.getAllBillers.invalidate();
      setIsOpen(false);
    },
  });
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (data: z.infer<typeof externalGuapSchema>) => {
    createBiller.mutate({ ...data, type: data.type as ExternalGuapType });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Billers</h2>

        <Dialog
          openButton={<Button>Create</Button>}
          title="Create Biller"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        >
          <Form
            schema={externalGuapSchema}
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
                options: mapEnumToLabelValuePair(ExternalGuapType),
                label: "Type",
                hidden: true,
              },
            }}
            defaultValues={{
              type: ExternalGuapType.BILLER,
            }}
            renderAfter={() => (
              <div className="mt-4 flex justify-end">
                <Button isLoading={createBiller.isLoading} type="submit">
                  {createBiller.isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          />
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        {billers.data?.map((biller) => {
          return <ExternalGuapItem key={biller.id} externalGuap={biller} />;
        })}
      </div>
    </div>
  );
};

export default Billers;
