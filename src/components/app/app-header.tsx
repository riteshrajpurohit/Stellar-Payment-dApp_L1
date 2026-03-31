import { NetworkBadge } from "@/components/app/network-badge";
import { WalletButton } from "@/components/app/wallet-button";
import { Badge } from "@/components/ui/badge";
import { shortenAddress } from "@/utils/format";

interface AppHeaderProps {
  isConnected: boolean;
  walletAddress: string;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const AppHeader = ({
  isConnected,
  walletAddress,
  isConnecting,
  onConnect,
  onDisconnect,
}: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-content-center rounded-xl border border-cyan-300/40 bg-cyan-300/15 text-lg font-semibold text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            S
          </div>
          <div>
            <p className="text-base font-semibold tracking-wide text-white">
              Stellar Pay Console
            </p>
            <p className="text-xs text-slate-400">
              White Belt Level 1 Mini dApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NetworkBadge />
          {isConnected ? (
            <Badge className="hidden border-white/20 bg-white/5 text-slate-200 md:inline-flex">
              {shortenAddress(walletAddress)}
            </Badge>
          ) : null}
          <WalletButton
            isConnected={isConnected}
            isLoading={isConnecting}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>
      </div>
    </header>
  );
};
