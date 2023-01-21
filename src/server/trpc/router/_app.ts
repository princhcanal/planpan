import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { externalGuapRouter } from "./externalGuap";
import { guapRouter } from "./guap";
import { transactionRouter } from "./transaction";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  guap: guapRouter,
  externalGuap: externalGuapRouter,
  transaction: transactionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
