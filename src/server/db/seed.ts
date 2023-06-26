import { db } from "./index";
import { RecipientType, recipients, wallets } from "./schema/wallets";
import { TransactionType, transactions } from "./schema/transactions";

export const addSeedData = async (userId: string) => {
  const bpiSavingsAccount = await db
    .insert(wallets)
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
    .insert(wallets)
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
    .insert(recipients)
    .values({
      name: "Mama's Metrobank Savings Account",
      userId,
      description: "Mama's Main Savings Account",
      type: RecipientType.PEER,
    })
    .returning()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then((res) => res[0]!);

  await db.insert(recipients).values({
    name: "PLDT Home",
    userId,
    description: "Account No. 123456789",
    type: RecipientType.BILLER,
  });

  await db.insert(transactions).values({
    description: "Fund Transfer",
    amount: 5000,
    type: TransactionType.DEBIT,
    walletId: bpiSavingsAccount.id,
    internalWalletId: metrobankSavingsAccount.id,
  });

  await db.insert(transactions).values({
    description: "Groceries",
    amount: 5000,
    type: TransactionType.DEBIT,
    walletId: bpiSavingsAccount.id,
    recipientId: mamaSavingsAccount.id,
  });
};
