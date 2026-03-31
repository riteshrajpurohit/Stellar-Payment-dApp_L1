export interface TransactionInput {
  recipient: string;
  amount: string;
  memo?: string;
}

const STELLAR_ADDRESS_PATTERN = /^G[A-Z2-7]{55}$/;

export const validateRecipient = (recipient: string): string | null => {
  const normalizedRecipient = recipient.trim();

  if (!normalizedRecipient) {
    return "Recipient address is required.";
  }

  if (!STELLAR_ADDRESS_PATTERN.test(normalizedRecipient)) {
    return "Recipient address format looks invalid.";
  }

  return null;
};

export const validateAmount = (amount: string): string | null => {
  if (!amount.trim()) {
    return "Amount is required.";
  }

  const parsed = Number(amount);

  if (Number.isNaN(parsed)) {
    return "Amount must be a valid number.";
  }

  if (parsed <= 0) {
    return "Amount must be greater than zero.";
  }

  if (!Number.isFinite(parsed)) {
    return "Amount is invalid.";
  }

  return null;
};

export const validateMemo = (memo?: string): string | null => {
  if (!memo) return null;

  if (memo.length > 28) {
    return "Memo must be 28 characters or fewer for text memo.";
  }

  return null;
};

export const validateTransactionInput = (
  input: TransactionInput,
): string | null => {
  return (
    validateRecipient(input.recipient) ??
    validateAmount(input.amount) ??
    validateMemo(input.memo)
  );
};
