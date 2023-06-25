import { type NextPage } from "next";
import { Form } from "../../components/form/Form";
import { GuapItem } from "../../components/guap/GuapItem";
import { Button } from "../../components/ui/Button";
import { guap } from "../../types/zod";
import { trpc } from "../../utils/trpc";
import { type z } from "zod";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { Plus } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import { GuapSkeleton } from "../../components/guap/GuapSkeleton";

const Guaps: NextPage = () => {
  const utils = trpc.useContext();
  const { data, isLoading, isFetching } = trpc.guap.getAll.useQuery();
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
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold">Guaps</h2>
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
                  placeholder: "5,000",
                  label: "Balance",
                  max: 1_000_000_000_000,
                  currency: "₱",
                },
              }}
              renderAfter={() => (
                <Button
                  className="mt-4 w-full"
                  isLoading={createGuap.isLoading}
                  type="submit"
                >
                  {createGuap.isLoading ? "Saving..." : "Save"}
                </Button>
              )}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        {data?.map((guap) => {
          return <GuapItem key={guap.id} guap={guap} />;
        })}

        {isLoading &&
          Array(6)
            .fill(0)
            .map((_, i) => <GuapSkeleton key={i} />)}
      </div>
    </div>
  );
};

export default Guaps;
