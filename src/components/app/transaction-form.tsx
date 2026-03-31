"use client";

import { Loader2, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateTransactionInput } from "@/utils/validation";

interface TransactionFormProps {
  disabled: boolean;
  onSubmit: (payload: {
    recipient: string;
    amount: string;
    memo?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const TransactionForm = ({
  disabled,
  onSubmit,
  isSubmitting,
}: TransactionFormProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const validationMessage = useMemo(
    () => validateTransactionInput({ recipient, amount, memo }),
    [amount, memo, recipient],
  );

  const canSubmit = !disabled && !isSubmitting && !validationMessage;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    await onSubmit({
      recipient: recipient.trim(),
      amount: amount.trim(),
      memo: memo.trim() || undefined,
    });
  };

  return (
    <Card
      id="send"
      className="border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl"
    >
      <CardHeader>
        <CardTitle className="text-xl text-white">Send XLM Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-slate-200">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="G..."
              className="border-white/20 bg-black/30 text-white placeholder:text-slate-500"
              disabled={disabled || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-200">
              Amount (XLM)
            </Label>
            <Input
              id="amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="10"
              className="border-white/20 bg-black/30 text-white placeholder:text-slate-500"
              disabled={disabled || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo" className="text-slate-200">
              Memo (optional)
            </Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="Payment for QA test"
              maxLength={28}
              className="min-h-20 border-white/20 bg-black/30 text-white placeholder:text-slate-500"
              disabled={disabled || isSubmitting}
            />
            <p className="text-xs text-slate-400">
              Text memo max length: 28 characters.
            </p>
          </div>

          {validationMessage ? (
            <p className="text-sm text-amber-200">{validationMessage}</p>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200 disabled:bg-cyan-300/50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting transaction...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Send XLM
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
