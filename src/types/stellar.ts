export type WalletConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

export type TxStatus = "idle" | "pending" | "success" | "error";

export interface TransactionResult {
  hash: string;
  recipient: string;
  amount: string;
  memo?: string;
  explorerUrl: string;
  ledger?: number;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  status: Exclude<TxStatus, "idle">;
  title: string;
  description: string;
  hash?: string;
  timestamp: number;
}
