import { Navbar } from "@/components/dashboard/navbar";
import { PortfolioCards } from "@/components/dashboard/portfolio-cards";
import { TokenHoldings } from "@/components/dashboard/token-holdings";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          {/* Left column */}
          <div>
            <PortfolioCards />
            <TokenHoldings />
          </div>

          {/* Right column */}
          <RecentTransactions />
        </div>
      </main>
    </div>
  );
}