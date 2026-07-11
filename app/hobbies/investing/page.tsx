import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import SplitPage from "@/components/SplitPage";
import { getInvestingData, type InvestingData, type Stock } from "@/lib/notion-investing";

export const metadata: Metadata = {
  title: "Investing",
  description: "Investing notes and holdings by Elias Lankinen.",
};

export default async function Investing() {
  let data: InvestingData = { marketAnalysis: [], stocks: [] };
  let errorMessage = "";

  try {
    data = await getInvestingData();
  } catch (error) {
    console.error("Failed to load Notion investing data", error);
    errorMessage = "Investing data is temporarily unavailable.";
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_16%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_84%_14%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_80%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.3),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <SplitPage
          left={
            <>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Hobbies / Investing</p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                I bought my first shares when I was seven years old, and I’ve learned a lot since then by following the stock market.
              </p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                I believe markets are generally very efficient, so I don’t expect to consistently pick winners with the amount of time I spend researching.
              </p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                Most of my money is in S&P 500 and global ETFs, but I’ve also made a few small investments in more niche ETFs based on where I think the world and markets are heading.
              </p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                This is not a financial advice.
              </p>
            </>
          }
          right={
            <>
              {errorMessage ? (
                <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">
                  {errorMessage}
                </p>
              ) : null}

              {!errorMessage ? (
                <>
                  <section aria-labelledby="market-analysis-heading">
                    <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-lime-100/58">Writings</p>
                        <h1 id="market-analysis-heading" className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                          Market Analysis
                        </h1>
                      </div>
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/34">
                        {data.marketAnalysis.length.toString().padStart(2, "0")}
                      </p>
                    </div>

                    {data.marketAnalysis.length === 0 ? (
                      <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">
                        No market analysis published yet.
                      </p>
                    ) : (
                      <ol className="grid gap-3">
                        {data.marketAnalysis.map((item, index) => (
                          <li key={item.id}>
                            <Link
                              className="group block border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-5"
                              href={`/hobbies/investing/market-analysis/${item.id}`}
                            >
                              <article>
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="font-mono text-xs uppercase tracking-[0.1em] text-white/34">{formatDate(item.date)}</p>
                                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{item.name}</h2>
                                  </div>
                                  <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/34">
                                    {String(index + 1).padStart(2, "0")}
                                  </p>
                                </div>
                                {item.description ? <p className="mt-4 text-base leading-7 text-white/64">{item.description}</p> : null}
                                <p className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62 transition group-hover:text-lime-100">
                                  Read analysis
                                </p>
                              </article>
                            </Link>
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>

                  <section aria-labelledby="stocks-heading">
                    <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-lime-100/58">Portfolio</p>
                        <h2 id="stocks-heading" className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                          Stocks
                        </h2>
                      </div>
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/34">
                        {data.stocks.length.toString().padStart(2, "0")}
                      </p>
                    </div>

                    {data.stocks.length === 0 ? (
                      <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">
                        No stocks listed yet.
                      </p>
                    ) : (
                      <ol className="grid gap-3">
                        {data.stocks.map((stock) => (
                          <li key={stock.id}>
                            <StockCard stock={stock} />
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                </>
              ) : null}
            </>
          }
          rightClassName="grid gap-10"
        />
      </div>
    </main>
  );
}

function StockCard({ stock }: { stock: Stock }) {
  return (
    <article className="border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {stock.ticker ? (
              <span className="border border-lime-100/20 bg-lime-100/10 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/76">
                {stock.ticker}
              </span>
            ) : null}
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-white/34">{formatDate(stock.date)}</span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{stock.name}</h3>
        </div>

        <div className="border border-white/10 bg-black/18 px-3 py-2 font-mono text-sm uppercase tracking-[0.08em] text-white/72 sm:text-right">
          {formatPrice(stock.price, stock.currency)}
        </div>
      </div>

      {stock.description ? <p className="mt-4 text-base leading-7 text-white/64">{stock.description}</p> : null}
    </article>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Undated";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatPrice(price: number | null, currency: string) {
  if (price === null) {
    return currency || "No price";
  }

  return [currency, new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(price)].filter(Boolean).join(" ");
}
