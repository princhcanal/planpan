import { router } from "../trpc";
import { authRouter } from "./auth";
import { recipientRouter } from "./recipient";
import { walletRouter } from "./wallet";
import { transactionRouter } from "./transaction";

export const appRouter = router({
  auth: authRouter,
  wallet: walletRouter,
  recipient: recipientRouter,
  transaction: transactionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
