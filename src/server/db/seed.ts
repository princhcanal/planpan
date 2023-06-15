import { db } from "./index";
import { ExternalGuapType, externalGuaps, guaps } from "./schema/guaps";
import { TransactionType, transactions } from "./schema/transactions";

export const addSeedData = async (userId: string) => {
  const bpiSavingsAccount = await db
    .insert(guaps)
    .values({
      name: "BPI Savings Account",
      userId,
      balance: 50000,
      description: "Main Savings Account",
    })
    .returning()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then((res) => res[0]!);

  const metrobankSavingsAccount = await db
    .insert(guaps)
    .values({
      name: "Metrobank Savings Account",
      userId,
      balance: 50000,
      description: "Secondary Savings Account",
    })
    .returning()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then((res) => res[0]!);

  const mamaSavingsAccount = await db
    .insert(externalGuaps)
    .values({
      name: "Mama's Metrobank Savings Account",
      userId,
      description: "Mama's Main Savings Account",
      type: ExternalGuapType.PEER,
    })
    .returning()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then((res) => res[0]!);

  await db.insert(externalGuaps).values({
    name: "PLDT Home",
    userId,
    description: "Account No. 123456789",
    type: ExternalGuapType.BILLER,
  });

  await db.insert(transactions).values({
    description: "Fund Transfer",
    amount: 5000,
    type: TransactionType.OUTGOING,
    guapId: bpiSavingsAccount.id,
    internalGuapId: metrobankSavingsAccount.id,
  });

  await db.insert(transactions).values({
    description: "Groceries",
    amount: 5000,
    type: TransactionType.OUTGOING,
    guapId: bpiSavingsAccount.id,
    externalGuapId: mamaSavingsAccount.id,
  });
};
