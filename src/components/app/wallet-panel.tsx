import { AlertTriangle, CheckCircle2, Copy, PlugZap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceCard } from "@/components/app/balance-card";
import { shortenAddress } from "@/utils/format";

interface WalletPanelProps {
  isConnected: boolean;
  address: string;
  balance: string | null;
  isBalanceLoading: boolean;
  balanceError: string | null;
  onRefreshBalance: () => void;
  onDisconnect: () => void;
}

export const WalletPanel = ({
  isConnected,
  address,
  balance,
  isBalanceLoading,
  balanceError,
  onRefreshBalance,
  onDisconnect,
}: WalletPanelProps) => {
  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
  };

  return (
    <Card className="border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl text-white">Wallet Panel</CardTitle>
        <Badge
          className={
            isConnected
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border-slate-500/40 bg-slate-600/20 text-slate-200"
          }
        >
          {isConnected ? "Connected" : "Not Connected"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="mb-1 flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="size-4 text-emerald-300" />
                Active public key
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-sm text-white">
                  {shortenAddress(address, 10, 8)}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyAddress}
                  className="h-8 px-2 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <Copy className="mr-1 size-4" />
                  Copy
                </Button>
              </div>
            </div>

            <BalanceCard
              balance={balance}
              isLoading={isBalanceLoading}
              error={balanceError}
              onRefresh={onRefreshBalance}
            />

            <Button
              variant="outline"
              onClick={onDisconnect}
              className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <PlugZap className="mr-2 size-4" />
              Disconnect Wallet
            </Button>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 bg-black/20 p-4 text-slate-300">
            <div className="mb-2 flex items-center gap-2 text-slate-200">
              <AlertTriangle className="size-4 text-amber-300" />
              Wallet not connected
            </div>
            <p className="text-sm">
              Connect Freighter to view your Testnet balance and send payments.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
