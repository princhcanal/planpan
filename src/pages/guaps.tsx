import { type NextPage } from "next";
import { Form } from "../components/form/Form";
import { GuapItem } from "../components/guap/GuapItem";
import { Dialog } from "../components/primitives/Dialog";
import { Button } from "../components/ui/Button";
import { guap } from "../types/zod";
import { trpc } from "../utils/trpc";
import { type z } from "zod";
import { useState } from "react";

const Guaps: NextPage = () => {
  const utils = trpc.useContext();
  const guaps = trpc.guap.getAll.useQuery();
  const createGuap = trpc.guap.create.useMutation({
    onSuccess: () => {
      utils.guap.getAll.invalidate();
      setIsOpen(false);
    },
  });
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (data: z.infer<typeof guap>) => {
    createGuap.mutate(data);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Guaps</h2>

        <Dialog
          openButton={<Button>Create</Button>}
          title="Create Guap"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        >
          <Form
            schema={guap}
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
                placeholder: "5000",
                label: "Balance",
              },
            }}
            renderAfter={() => (
              <div className="mt-4 flex justify-end">
                <Button isLoading={createGuap.isLoading} type="submit">
                  {createGuap.isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          />
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        {guaps.data?.map((guap) => {
          return <GuapItem key={guap.id} guap={guap} />;
        })}
      </div>
    </div>
  );
};

export default Guaps;
