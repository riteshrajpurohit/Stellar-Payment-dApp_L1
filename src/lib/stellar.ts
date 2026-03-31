import {
  Asset,
  BASE_FEE,
  Horizon,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

import {
  MIN_BASE_FEE_XLM,
  STELLAR_EXPLORER_BASE_URL,
  STELLAR_HORIZON_URL,
  STELLAR_NETWORK_PASSPHRASE,
} from "@/lib/constants";
import { explorerTxLink } from "@/utils/format";

const server = new Horizon.Server(STELLAR_HORIZON_URL);

interface BuildAndSubmitArgs {
  senderPublicKey: string;
  recipientPublicKey: string;
  amount: string;
  memo?: string;
  signWithFreighter: (xdr: string) => Promise<string>;
}

export const fetchXlmBalance = async (publicKey: string): Promise<string> => {
  const account = await server.loadAccount(publicKey);
  const nativeBalance = account.balances.find(
    (balance) => balance.asset_type === "native",
  );
  return nativeBalance?.balance ?? "0";
};

export const hasEnoughSpendableBalance = (
  balance: string,
  amount: string,
): boolean => {
  const spendable = Number(balance);
  const requested = Number(amount);

  if (Number.isNaN(spendable) || Number.isNaN(requested)) {
    return false;
  }

  return spendable > requested + MIN_BASE_FEE_XLM;
};

export const buildAndSubmitPayment = async ({
  senderPublicKey,
  recipientPublicKey,
  amount,
  memo,
  signWithFreighter,
}: BuildAndSubmitArgs) => {
  const senderAccount = await server.loadAccount(senderPublicKey);

  let txBuilder = new TransactionBuilder(senderAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  }).addOperation(
    Operation.payment({
      destination: recipientPublicKey,
      asset: Asset.native(),
      amount,
    }),
  );

  if (memo?.trim()) {
    txBuilder = txBuilder.addMemo(Memo.text(memo.trim()));
  }

  const unsignedTx = txBuilder.setTimeout(180).build();
  const signedXdr = await signWithFreighter(unsignedTx.toXDR());

  const signedTransaction = TransactionBuilder.fromXDR(
    signedXdr,
    STELLAR_NETWORK_PASSPHRASE,
  );

  const response = await server.submitTransaction(signedTransaction);

  return {
    hash: response.hash,
    ledger: response.ledger,
    successful: response.successful,
    explorerUrl: explorerTxLink(STELLAR_EXPLORER_BASE_URL, response.hash),
  };
};
