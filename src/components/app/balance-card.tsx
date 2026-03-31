import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatXlm } from "@/utils/format";

interface BalanceCardProps {
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  disabled?: boolean;
}

export const BalanceCard = ({
  balance,
  isLoading,
  error,
  onRefresh,
  disabled,
}: BalanceCardProps) => {
  return (
    <Card className="border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          XLM Balance
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-slate-300 hover:bg-white/10 hover:text-white"
          onClick={onRefresh}
          disabled={disabled || isLoading}
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-44 rounded-md bg-white/10" />
        ) : error ? (
          <div className="rounded-md border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4" />
              Unable to fetch balance
            </div>
            <p className="mt-1 text-red-100/80">{error}</p>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <span className="text-4xl font-semibold tracking-tight text-white">
              {formatXlm(balance ?? 0)}
            </span>
            <span className="pb-1 text-sm uppercase tracking-[0.18em] text-slate-400">
              XLM
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
