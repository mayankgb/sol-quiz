"use client"

import { SessionProvider } from "next-auth/react";
import React, { useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Provider({ children }: { children: React.ReactNode }) {
    const endpoint = "https://api.devnet.solana.com"

    return (
        <SessionProvider>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={[]}>
                    <WalletModalProvider>
                        {children}
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </SessionProvider>
    )
}