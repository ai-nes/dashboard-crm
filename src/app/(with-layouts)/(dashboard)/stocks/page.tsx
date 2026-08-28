import ExchangeStock from "./_component/exchange-stock";
import LastTransaction from "./_component/last-transaction";
import MarketNews from "./_component/market-news";
import MarketOverview from "./_component/market-overview";
import PortfolioPerformance from "./_component/portfolio-performance";
import Watchlist from "./_component/watchlist";

export default function StocksPage() {
  return (
    <div className="mt-6 space-y-5">
      {/* Header Section */}
      <div className="px-2 lg:px-6">
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Stocks</h1>
        <p className="text-sm leading-5 text-text-tertiary">
          Monitor portfolio performance and market activity effortlessly.
        </p>
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <PortfolioPerformance />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Watchlist />
          <ExchangeStock />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <MarketOverview />
          <LastTransaction />
        </div>
        <MarketNews />
      </div>
    </div>
  );
}
