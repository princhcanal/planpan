import { router } from "../trpc";
import { authRouter } from "./auth";
import { walletRouter } from "./wallet";
import { transactionRouter } from "./transaction";

export const appRouter = router({
  auth: authRouter,
  wallet: walletRouter,
  transaction: transactionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
