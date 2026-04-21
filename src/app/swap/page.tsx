import { Navbar } from "@/components/dashboard/navbar";
import { SwapForm } from "@/components/swap/swap-form";

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 py-10 flex flex-col items-center gap-6">
        <div className="w-full max-w-md">
          <h1 className="text-lg font-semibold text-text mb-6">Swap</h1>
          <SwapForm />
        </div>
      </main>
    </div>
  );
}
