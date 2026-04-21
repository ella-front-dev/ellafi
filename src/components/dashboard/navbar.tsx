"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/wallet", label: "Wallet" },
  { href: "/trade", label: "Trade" },
  { href: "/swap", label: "Swap" },
];

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="h-12 border-b border-border bg-surface">
      <div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <span className="font-mono text-neutral tracking-widest text-sm">
            TERMINAL
          </span>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "px-3 py-1 rounded text-xs font-medium transition-colors",
                    isActive
                      ? "text-accent bg-accent-bg"
                      : "text-muted hover:text-text",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectButton.Custom>
            {({ account, openConnectModal, openAccountModal, mounted }) => {
              if (!mounted) {
                return (
                  <div
                    aria-hidden
                    className="h-8 w-[120px] rounded-md bg-surface-2"
                  />
                );
              }

              if (!account) {
                return (
                  <Button
                    variant="ghost"
                    onClick={openConnectModal}
                    className="h-8 border border-border text-accent hover:bg-surface-2 hover:text-accent px-3 text-sm"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              return (
                <Button
                  variant="ghost"
                  onClick={openAccountModal}
                  className="h-8 border border-border text-accent hover:bg-surface-2 hover:text-accent px-3 text-sm font-mono"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {truncateAddress(account.address)}
                  </span>
                </Button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
