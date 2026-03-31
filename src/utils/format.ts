export const shortenAddress = (
  address: string,
  front = 6,
  back = 6,
): string => {
  if (!address) return "";
  if (address.length <= front + back) return address;
  return `${address.slice(0, front)}...${address.slice(-back)}`;
};

export const formatXlm = (amount: string | number, decimals = 4): string => {
  const value = typeof amount === "number" ? amount : Number(amount);

  if (Number.isNaN(value)) {
    return "0.0000";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const explorerTxLink = (baseUrl: string, hash: string): string =>
  `${baseUrl}/${hash}`;
