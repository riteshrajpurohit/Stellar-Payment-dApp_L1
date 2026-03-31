import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FaucetHint = () => {
  return (
    <Card className="border-cyan-300/20 bg-cyan-500/5 shadow-[0_10px_50px_rgba(34,211,238,0.12)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-base text-cyan-100">
          Need Testnet Funds?
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-cyan-50/90">
        <p>
          Fund your Freighter account using Stellar Friendbot. Make sure
          Freighter is set to Testnet, then request XLM for your public key.
        </p>
        <Link
          className="mt-3 inline-flex text-sm font-medium text-cyan-200 underline decoration-cyan-200/40 underline-offset-4 transition hover:text-cyan-100"
          href="https://friendbot.stellar.org/"
          target="_blank"
          rel="noreferrer"
        >
          Open Testnet Faucet
        </Link>
      </CardContent>
    </Card>
  );
};
