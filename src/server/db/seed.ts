import { db } from "./index";
import { PaymentNetwork, WalletType, wallets } from "./schema/wallets";
import { TransactionType, transactions } from "./schema/transactions";

export const addSeedData = async (userId: string) => {
  const bpiSavingsAccount = await db
    .insert(wallets)
    .values({
      name: "BPI Savings Account",
      userId,
      balance: "50000",
      description: "Main Savings Account",
      type: WalletType.SAVINGS,
      paymentNetwork: PaymentNetwork.MASTERCARD,
    })
    .returning()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then((res) => res[0]!);

  const metrobankSavingsAccount = await db
    .insert(wallets)
    .values({
      name: "Metrobank Savings Account",
      userId,
      balance: "50000",
      description: "Secondary Savings Account",
      type: WalletType.SAVINGS,
      paymentNetwork: PaymentNetwork.MASTERCARD,
    })
    .returning()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then((res) => res[0]!);

  await db.insert(transactions).values({
    name: "Test Fund Transfer",
    description: "Fund Transfer",
    amount: "5000",
    type: TransactionType.TRANSFER,
    walletId: bpiSavingsAccount.id,
    internalWalletId: metrobankSavingsAccount.id,
  });

  await db.insert(transactions).values({
    name: "Groceries",
    amount: "5000",
    type: TransactionType.EXPENSE,
    walletId: bpiSavingsAccount.id,
  });

  await db.insert(transactions).values({
    name: "Salary",
    amount: "50000",
    type: TransactionType.INCOME,
    walletId: metrobankSavingsAccount.id,
  });
};
