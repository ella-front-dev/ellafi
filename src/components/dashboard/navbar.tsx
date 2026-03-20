"use client";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="h-12 border-b border-border bg-surface">
      <div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <span className="font-mono text-neutral tracking-widest text-sm">
          TERMINAL
        </span>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="h-8 border border-border text-accent hover:bg-surface-2 hover:text-accent px-3 text-sm"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}
