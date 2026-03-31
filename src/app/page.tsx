"use client";

import {
  ArrowDownToLine,
  ExternalLink,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { ActivityCard } from "@/components/app/activity-card";
import { AppHeader } from "@/components/app/app-header";
import { FaucetHint } from "@/components/app/faucet-hint";
import { TransactionForm } from "@/components/app/transaction-form";
import { TxResultCard } from "@/components/app/tx-result-card";
import { WalletPanel } from "@/components/app/wallet-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStellarWallet } from "@/hooks/use-stellar-wallet";
import { shortenAddress } from "@/utils/format";

export default function Home() {
  const {
    connectionState,
    walletAddress,
    isConnected,
    isFreighterInstalled,
    balance,
    isBalanceLoading,
    balanceError,
    txStatus,
    txError,
    lastTx,
    activity,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    sendPayment,
  } = useStellarWallet();

  const isConnecting = connectionState === "connecting";

  return (
    <div className="min-h-screen">
      <AppHeader
        isConnected={isConnected}
        walletAddress={walletAddress}
        isConnecting={isConnecting}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 md:px-8 md:py-14">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-7 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 size-48 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100">
              <ShieldCheck className="size-4" />
              Stellar Testnet Live
            </div>

            <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
              Stellar Testnet Payment Console
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              Connect Freighter, inspect your current Testnet XLM balance, and
              submit a real payment transaction with production-grade feedback,
              validation, and explorer traceability.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={connectWallet}
                disabled={isConnected || isConnecting}
                className="bg-cyan-300 text-slate-950 hover:bg-cyan-200 disabled:bg-cyan-300/60"
              >
                <Wallet className="mr-2 size-4" />
                {isConnected ? "Wallet Connected" : "Connect Freighter"}
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <a href="#send">
                  <ArrowDownToLine className="mr-2 size-4" />
                  Go to Send Transaction
                </a>
              </Button>
            </div>

            {!isFreighterInstalled ? (
              <Card className="border-amber-400/25 bg-amber-500/10">
                <CardContent className="flex flex-col gap-2 p-4 text-sm text-amber-100 md:flex-row md:items-center md:justify-between">
                  <p>
                    Freighter wallet was not detected in this browser. Install
                    it to continue.
                  </p>
                  <a
                    href="https://www.freighter.app"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center font-medium text-amber-50 underline decoration-amber-200/40 underline-offset-4"
                  >
                    Install Freighter
                    <ExternalLink className="ml-1 size-4" />
                  </a>
                </CardContent>
              </Card>
            ) : null}

            {isConnected ? (
              <p className="text-sm text-slate-300">
                Connected wallet:{" "}
                <span className="font-mono text-white">
                  {shortenAddress(walletAddress, 12, 10)}
                </span>
              </p>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <WalletPanel
            isConnected={isConnected}
            address={walletAddress}
            balance={balance}
            isBalanceLoading={isBalanceLoading}
            balanceError={balanceError}
            onRefreshBalance={() => void refreshBalance()}
            onDisconnect={disconnectWallet}
          />

          <div className="space-y-6">
            <TransactionForm
              disabled={!isConnected}
              isSubmitting={txStatus === "pending"}
              onSubmit={sendPayment}
            />
            <TxResultCard status={txStatus} error={txError} result={lastTx} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <FaucetHint />
          <ActivityCard items={activity} />
        </section>
      </main>
    </div>
  );
}
