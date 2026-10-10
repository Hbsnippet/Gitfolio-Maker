export default function PortfolioLoading() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#40362E]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="h-6 w-24 rounded bg-[#E7E1D4]" />
        <div className="h-4 w-28 rounded bg-[#E7E1D4]" />
      </nav>
      <section className="mx-auto grid max-w-6xl animate-pulse gap-10 px-6 pt-10 md:grid-cols-12">
        <div className="space-y-4 md:col-span-7">
          <div className="h-3 w-24 rounded bg-[#A6AD91]/40" />
          <div className="h-16 w-full max-w-md rounded bg-[#E7E1D4]" />
          <div className="h-4 w-full max-w-lg rounded bg-[#E7E1D4]" />
        </div>
        <div className="aspect-square max-w-xs rounded-[2rem] bg-[#E7E1D4] md:col-span-4 md:col-start-9 md:mt-16" />
      </section>
    </main>
  );
}
