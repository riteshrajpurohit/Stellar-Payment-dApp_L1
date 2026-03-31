# Stellar Payment dApp

A decentralized payment application (dApp) built on the **Stellar Testnet** using **Next.js 14**, **TypeScript**, and **Tailwind CSS**. Users can connect their [Freighter](https://www.freighter.app/) browser wallet, inspect their live XLM balance, and submit real payment transactions — complete with validation, signing, status tracking, and Stellar Explorer deep-links.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
  - [Wallet Connection Flow](#wallet-connection-flow)
  - [Transaction Flow](#transaction-flow)
  - [Validation Rules](#validation-rules)
- [Key Components](#key-components)
- [Key Modules](#key-modules)
- [Screenshots](#screenshots)
- [Useful Links](#useful-links)

---

## Overview

Stellar Payment dApp is a **client-side only** application that interacts directly with the Stellar Testnet via the [Horizon API](https://developers.stellar.org/api). It uses the Freighter browser extension to let users sign transactions without ever exposing their private key to the web app.

> **Note:** This app targets the **Stellar Testnet**. No real funds are at risk. Use the [Friendbot faucet](#useful-links) to top up your Testnet account.

---

## Features

| Feature | Description |
|---|---|
| 🔗 Wallet Connection | Connect/disconnect Freighter with automatic reconnection on page load |
| 💰 Live Balance | Real-time XLM balance fetched from Horizon with manual refresh |
| 💸 Send XLM | Build, sign, and submit native XLM payment transactions |
| 📝 Memo Support | Optional text memo (≤ 28 characters) on every transaction |
| ✅ Input Validation | Client-side validation of recipient address, amount, and memo |
| 📊 Transaction Result | Full transaction hash, ledger number, and Stellar Explorer link |
| 🕓 Activity Feed | In-session log of the last 5 transaction attempts (pending / success / error) |
| 🚰 Faucet Hint | Built-in link to Friendbot to fund Testnet accounts |
| 🔔 Toast Notifications | Real-time feedback for every wallet and transaction event |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) |
| Wallet | [@stellar/freighter-api](https://www.npmjs.com/package/@stellar/freighter-api) |
| Blockchain SDK | [@stellar/stellar-sdk](https://www.npmjs.com/package/@stellar/stellar-sdk) |
| Linting | ESLint (Next.js config) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts and global providers
│   ├── page.tsx            # Main application page (home)
│   └── globals.css         # Global CSS and Tailwind directives
│
├── components/
│   ├── app/                # Feature-specific UI components
│   │   ├── app-header.tsx      # Top navigation bar with wallet connect button
│   │   ├── wallet-panel.tsx    # Wallet info card (address + balance + actions)
│   │   ├── balance-card.tsx    # Balance display sub-component
│   │   ├── transaction-form.tsx # Send payment form (recipient, amount, memo)
│   │   ├── tx-result-card.tsx  # Transaction result display (hash, explorer link)
│   │   ├── activity-card.tsx   # Recent activity feed (last 5 transactions)
│   │   ├── faucet-hint.tsx     # Friendbot faucet helper card
│   │   ├── network-badge.tsx   # "Stellar Testnet" status badge
│   │   └── wallet-button.tsx   # Reusable connect/disconnect button
│   └── ui/                 # Generic shadcn/ui primitives (Button, Card, Input…)
│
├── hooks/
│   └── use-stellar-wallet.ts  # Central state hook: wallet, balance, transactions
│
├── lib/
│   ├── stellar.ts          # Horizon API calls and transaction builder
│   ├── constants.ts        # Network passphrase, Horizon URL, Explorer URL
│   ├── toast.ts            # Typed Sonner toast helpers (success / error / info)
│   └── utils.ts            # shadcn cn() utility
│
├── types/
│   └── stellar.ts          # Shared TypeScript types (TxStatus, ActivityItem…)
│
└── utils/
    ├── format.ts           # shortenAddress, formatXlm, explorerTxLink
    └── validation.ts       # validateRecipient, validateAmount, validateMemo
```

---

## Prerequisites

- **Node.js** v18 or later
- **npm**, **yarn**, or **pnpm**
- **[Freighter wallet extension](https://www.freighter.app/)** installed in your browser
- A funded Stellar **Testnet** account (use [Friendbot](https://laboratory.stellar.org/#account-creator?network=test))

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/riteshrajpurohit/Stellar-Payment-dApp_L1.git
cd Stellar-Payment-dApp_L1
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables (optional)

The app ships with sensible Testnet defaults. To override them, copy the example below into a `.env.local` file at the project root:

```env
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet/tx
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm run start
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | `https://horizon-testnet.stellar.org` | Stellar Horizon REST API base URL |
| `NEXT_PUBLIC_STELLAR_EXPLORER_BASE_URL` | `https://stellar.expert/explorer/testnet/tx` | Base URL for transaction deep-links |

> Both variables are **public** (prefixed with `NEXT_PUBLIC_`) and embedded at build time. Never store secrets here.

---

## How It Works

### Wallet Connection Flow

```
Page load
  └─ checkFreighterInstallation()
        ├─ Not installed → show "Install Freighter" banner
        └─ Installed → isAllowed() + getAddress()
              ├─ Already authorized → auto-connect (restore session)
              └─ Not authorized → idle (user clicks "Connect Freighter")
                    └─ requestAccess() → prompt Freighter popup
                          ├─ Approved → store address, fetch balance
                          └─ Rejected / timeout → show error toast
```

The hook wraps every Freighter API call in a `withTimeout()` helper to prevent indefinite hangs caused by locked or unresponsive extensions.

### Transaction Flow

```
User submits form
  └─ validateTransactionInput()              ← client-side field checks
        └─ StrKey.isValidEd25519PublicKey()  ← SDK address validation
              └─ hasEnoughSpendableBalance() ← balance vs. amount + fee
                    └─ buildAndSubmitPayment()
                          ├─ server.loadAccount(sender)      ← Horizon
                          ├─ TransactionBuilder → addOperation(payment)
                          ├─ .addMemo() if memo provided
                          ├─ .setTimeout(180).build() → XDR
                          ├─ freighterSignTransaction(xdr)   ← Freighter popup
                          ├─ TransactionBuilder.fromXDR(signedXdr)
                          └─ server.submitTransaction()      ← Horizon
                                ├─ success → hash + ledger + explorerUrl
                                └─ error   → error toast + activity log
```

Transactions have a **180-second timeout** set on-chain. The minimum fee is Stellar's `BASE_FEE` (100 stroops = 0.00001 XLM).

### Validation Rules

| Field | Rule |
|---|---|
| Recipient | Required · Must match `/^G[A-Z2-7]{55}$/` · Verified with `StrKey.isValidEd25519PublicKey` |
| Amount | Required · Must be a finite positive number · Sender balance must exceed `amount + 0.00001 XLM` |
| Memo | Optional · Maximum **28 characters** (Stellar text memo limit) |

---

## Key Components

### `AppHeader`
Top navigation bar. Shows the network badge and the wallet connect/disconnect button.

### `WalletPanel`
Displays the connected wallet address (truncated), current XLM balance, a refresh button, and a disconnect button. Shows a loading skeleton while the balance is fetching.

### `TransactionForm`
Controlled form with three fields: **Recipient** (Stellar public key), **Amount** (XLM), and **Memo** (optional). Disabled when no wallet is connected or a transaction is in flight.

### `TxResultCard`
Appears after a transaction attempt. On success, shows the transaction hash, ledger number, and a clickable link to Stellar Expert. On error, shows the failure message.

### `ActivityCard`
Keeps an in-memory list of the last 5 transaction events in the current session (pending → success/error), rendered as a timestamped feed.

### `FaucetHint`
Informational card with a direct link to [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test) for funding Testnet accounts.

---

## Key Modules

### `hooks/use-stellar-wallet.ts`
The central React hook that owns **all** application state:
- Wallet connection state machine (`idle | connecting | connected | disconnected`)
- Freighter installation detection with async fallback and timeout protection
- Balance fetching and caching via Horizon
- Transaction lifecycle management (`idle | pending | success | error`)
- Activity feed (last 5 items, newest first)

### `lib/stellar.ts`
Pure async functions for Horizon interaction:
- `fetchXlmBalance(publicKey)` — loads account and extracts the native XLM balance
- `hasEnoughSpendableBalance(balance, amount)` — guards against under-funded sends by checking `balance > amount + MIN_BASE_FEE_XLM`
- `buildAndSubmitPayment(args)` — full transaction pipeline: build → sign → submit

### `lib/constants.ts`
Central place for network configuration values sourced from environment variables with Testnet defaults.

### `utils/validation.ts`
Stateless, composable validation functions for each transaction field.

### `utils/format.ts`
Display helpers: `shortenAddress`, `formatXlm`, and `explorerTxLink`.

---

## Screenshots

### 1. Wallet Connected State

<img width="1470" height="956" alt="Screenshot 2026-03-31 at 9 54 51 PM" src="https://github.com/user-attachments/assets/6964d841-7861-4680-a2a1-b876603f079d" />

### 2. Balance Displayed

<img width="1470" height="956" alt="Screenshot 2026-03-31 at 9 55 09 PM" src="https://github.com/user-attachments/assets/c7e84208-4b80-45ea-a2eb-f437d735aa22" />

---

## Useful Links

| Resource | URL |
|---|---|
| Freighter Wallet | https://www.freighter.app |
| Stellar Testnet Faucet (Friendbot) | https://laboratory.stellar.org/#account-creator?network=test |
| Stellar Expert (Testnet Explorer) | https://stellar.expert/explorer/testnet |
| Horizon Testnet API | https://horizon-testnet.stellar.org |
| Stellar Developer Docs | https://developers.stellar.org |
| Freighter API Docs | https://docs.freighter.app |
