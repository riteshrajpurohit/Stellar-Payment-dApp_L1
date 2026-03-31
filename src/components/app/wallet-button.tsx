import { Loader2, LogOut, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WalletButtonProps {
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletButton = ({
  isConnected,
  isLoading,
  onConnect,
  onDisconnect,
}: WalletButtonProps) => {
  if (isConnected) {
    return (
      <Button
        onClick={onDisconnect}
        variant="outline"
        className="border-white/20 bg-white/5 text-white hover:bg-white/10"
      >
        <LogOut className="mr-2 size-4" />
        Disconnect
      </Button>
    );
  }

  return (
    <Button
      onClick={onConnect}
      disabled={isLoading}
      className="min-w-44 bg-cyan-300 text-slate-950 hover:bg-cyan-200 disabled:bg-cyan-300/70"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 size-4" />
          Connect Freighter
        </>
      )}
    </Button>
  );
};
