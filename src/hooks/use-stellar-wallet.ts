"use client";

if (typeof window !== "undefined" && window.performance) {
  if (typeof window.performance.clearMarks !== "function") {
    window.performance.clearMarks = () => {};
  }
  if (typeof window.performance.mark !== "function") {
    window.performance.mark = () => {};
  }
  if (typeof window.performance.measure !== "function") {
    window.performance.measure = () => {};
  }
}

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAddress,
  isConnected,
  isAllowed,
  requestAccess,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";

import { STELLAR_NETWORK_PASSPHRASE } from "@/lib/constants";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import type {
  ActivityItem,
  TransactionResult,
  TxStatus,
  WalletConnectionState,
} from "@/types/stellar";
import { validateTransactionInput } from "@/utils/validation";

interface SendPaymentInput {
  recipient: string;
  amount: string;
  memo?: string;
}

const loadStellarHelpers = () => import("@/lib/stellar");

const FREIGHTER_CONNECT_TIMEOUT_MS = 15000;

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

const mapFreighterError = (unknownError: unknown): string => {
  if (unknownError instanceof Error) {
    return unknownError.message;
  }

  const errorRecord = unknownError as
    | { message?: string; code?: number }
    | undefined;

  if (errorRecord?.message) {
    return errorRecord.message;
  }

  return "Unexpected wallet error.";
};

const checkFreighterInstallation = async (): Promise<boolean> => {
  if (typeof window === "undefined") {
    return false;
  }

  // Quick synchronous check for the injected property
  if (typeof window.freighter !== "undefined") {
    return true;
  }

  // Async fallback with strict timeout to prevent indefinite hanging
  // if the extension script has not initialized or is absent.
  try {
    const res = await withTimeout(
      isConnected(),
      800,
      "Freighter not detected within time limit.",
    );
    return res.isConnected;
  } catch {
    return false;
  }
};

export const useStellarWallet = () => {
  const [hasFreighter, setHasFreighter] = useState(false);
  const [connectionState, setConnectionState] =
    useState<WalletConnectionState>("idle");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txError, setTxError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<TransactionResult | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const addActivity = useCallback((item: ActivityItem) => {
    setActivity((prev) => [item, ...prev].slice(0, 5));
  }, []);

  const refreshBalance = useCallback(
    async (address?: string) => {
      const targetAddress = address ?? walletAddress;

      if (!targetAddress) {
        setBalance(null);
        return;
      }

      setIsBalanceLoading(true);
      setBalanceError(null);

      try {
        const { fetchXlmBalance } = await loadStellarHelpers();
        const freshBalance = await fetchXlmBalance(targetAddress);
        setBalance(freshBalance);
      } catch (error) {
        const msg =
          error instanceof Error
            ? error.message
            : "Failed to fetch wallet balance.";
        setBalanceError(msg);
        notifyError("Balance lookup failed", msg);
      } finally {
        setIsBalanceLoading(false);
      }
    },
    [walletAddress],
  );

  const initializeWallet = useCallback(async () => {
    const installed = await checkFreighterInstallation();
    setHasFreighter(installed);

    if (!installed) {
      setConnectionState("disconnected");
      return;
    }

    try {
      const allowed = await withTimeout(
        isAllowed(),
        1500,
        "Background check timeout",
      );

      if (!allowed.isAllowed) {
        setConnectionState("disconnected");
        return;
      }

      const account = await withTimeout(
        getAddress(),
        1500,
        "getAddress timeout",
      );

      if (account.error || !account.address) {
        setConnectionState("disconnected");
        return;
      }

      setWalletAddress(account.address);
      setConnectionState("connected");
      void refreshBalance(account.address);
    } catch {
      setConnectionState("disconnected");
    }
  }, [refreshBalance]);

  useEffect(() => {
    void initializeWallet();
  }, [initializeWallet]);

  const connectWallet = useCallback(async () => {
    const installed = await checkFreighterInstallation();
    setHasFreighter(installed);

    if (!installed) {
      notifyInfo(
        "Freighter wallet not found",
        "Install Freighter from freighter.app and refresh this page.",
      );
      return;
    }

    setConnectionState("connecting");

    try {
      const access = await withTimeout(
        requestAccess(),
        FREIGHTER_CONNECT_TIMEOUT_MS,
        "Freighter did not respond in time. Unlock the extension, allow popups, and try again.",
      );

      if (access.error || !access.address) {
        throw new Error(
          access.error?.message ?? "Wallet connection was rejected.",
        );
      }

      setWalletAddress(access.address);
      setConnectionState("connected");
      notifySuccess(
        "Wallet connected",
        "Freighter is now linked to this dApp.",
      );
      void refreshBalance(access.address);
    } catch (error) {
      setConnectionState("disconnected");
      notifyError("Connection failed", mapFreighterError(error));
    }
  }, [refreshBalance]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress("");
    setBalance(null);
    setBalanceError(null);
    setTxStatus("idle");
    setTxError(null);
    setLastTx(null);
    setConnectionState("disconnected");
    notifyInfo("Wallet disconnected", "You can reconnect anytime.");
  }, []);

  const signXdr = useCallback(
    async (xdr: string): Promise<string> => {
      if (!walletAddress) {
        throw new Error("No wallet connected.");
      }

      const signed = await freighterSignTransaction(xdr, {
        address: walletAddress,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
      });

      if (signed.error || !signed.signedTxXdr) {
        throw new Error(signed.error?.message ?? "Transaction signing failed.");
      }

      return signed.signedTxXdr;
    },
    [walletAddress],
  );

  const sendPayment = useCallback(
    async ({ recipient, amount, memo }: SendPaymentInput) => {
      if (!walletAddress) {
        const message = "Connect your wallet before sending XLM.";
        setTxError(message);
        notifyError("Wallet required", message);
        return;
      }

      const validationError = validateTransactionInput({
        recipient,
        amount,
        memo,
      });

      if (validationError) {
        setTxError(validationError);
        notifyError("Invalid transaction details", validationError);
        return;
      }

      const { StrKey } = await import("@stellar/stellar-sdk");

      if (!StrKey.isValidEd25519PublicKey(recipient.trim())) {
        const message = "Recipient address is not a valid Stellar public key.";
        setTxError(message);
        notifyError("Invalid address", message);
        return;
      }

      const { buildAndSubmitPayment, hasEnoughSpendableBalance } =
        await loadStellarHelpers();

      if (!balance || !hasEnoughSpendableBalance(balance, amount)) {
        const message =
          "Insufficient balance for this payment plus network fee.";
        setTxError(message);
        notifyError("Insufficient balance", message);
        return;
      }

      setTxStatus("pending");
      setTxError(null);

      const pendingId = `${Date.now()}-pending`;
      addActivity({
        id: pendingId,
        status: "pending",
        title: "Transaction pending",
        description: `Sending ${amount} XLM to ${recipient.slice(0, 6)}...`,
        timestamp: Date.now(),
      });

      try {
        const result = await buildAndSubmitPayment({
          senderPublicKey: walletAddress,
          recipientPublicKey: recipient.trim(),
          amount: Number(amount).toFixed(7),
          memo,
          signWithFreighter: signXdr,
        });

        const txResult: TransactionResult = {
          hash: result.hash,
          recipient: recipient.trim(),
          amount: Number(amount).toFixed(7),
          memo: memo?.trim(),
          explorerUrl: result.explorerUrl,
          ledger: result.ledger,
          createdAt: new Date().toISOString(),
        };

        setLastTx(txResult);
        setTxStatus("success");

        addActivity({
          id: `${Date.now()}-success`,
          status: "success",
          title: "Payment confirmed",
          description: `${amount} XLM sent successfully.`,
          hash: result.hash,
          timestamp: Date.now(),
        });

        notifySuccess("Payment submitted", `Hash: ${result.hash}`);
        await refreshBalance();
      } catch (error) {
        const message = mapFreighterError(error);
        setTxStatus("error");
        setTxError(message);

        addActivity({
          id: `${Date.now()}-error`,
          status: "error",
          title: "Payment failed",
          description: message,
          timestamp: Date.now(),
        });

        notifyError("Transaction failed", message);
      }
    },
    [addActivity, balance, refreshBalance, signXdr, walletAddress],
  );

  const isConnectedState =
    connectionState === "connected" && Boolean(walletAddress);

  return useMemo(
    () => ({
      connectionState,
      walletAddress,
      balance,
      isBalanceLoading,
      balanceError,
      txStatus,
      txError,
      lastTx,
      activity,
      isConnected: isConnectedState,
      isFreighterInstalled: hasFreighter,
      connectWallet,
      disconnectWallet,
      refreshBalance,
      sendPayment,
    }),
    [
      activity,
      balance,
      balanceError,
      connectWallet,
      connectionState,
      disconnectWallet,
      hasFreighter,
      isBalanceLoading,
      isConnectedState,
      lastTx,
      refreshBalance,
      sendPayment,
      txError,
      txStatus,
      walletAddress,
    ],
  );
};
