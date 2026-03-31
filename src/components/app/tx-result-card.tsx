import Link from "next/link";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionResult, TxStatus } from "@/types/stellar";

interface TxResultCardProps {
  status: TxStatus;
  error: string | null;
  result: TransactionResult | null;
}

export const TxResultCard = ({ status, error, result }: TxResultCardProps) => {
  if (status === "idle") return null;

  if (status === "error") {
    return (
      <Card className="border-red-400/20 bg-red-500/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-100">
            <XCircle className="size-5" />
            Transaction Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-100/90">
            {error ?? "Unknown transaction error."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "pending") {
    return (
      <Card className="border-amber-400/20 bg-amber-500/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-amber-100">
            Transaction in progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-100/90">
            Freighter approval and network confirmation are in progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card className="border-emerald-400/20 bg-emerald-500/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-100">
          <CheckCircle2 className="size-5" />
          Payment Successful
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-emerald-100/90">
        <p>Amount: {result.amount} XLM</p>
        <p className="break-all">Transaction hash: {result.hash}</p>
        <Link
          href={result.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center font-medium text-emerald-100 underline decoration-emerald-200/40 underline-offset-4 hover:text-white"
        >
          View on Stellar Explorer
          <ExternalLink className="ml-1 size-4" />
        </Link>
      </CardContent>
    </Card>
  );
};
