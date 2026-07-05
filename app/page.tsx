import VisitorGlobe from "@/components/VisitorGlobe";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_46%,rgba(135,171,105,0.24),transparent_22rem),radial-gradient(circle_at_36%_34%,rgba(91,118,137,0.26),transparent_24rem),linear-gradient(115deg,#050706_0%,#08100c_38%,#162111_72%,#050706_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.32)_45%,rgba(0,0,0,0.72)),radial-gradient(circle_at_50%_120%,rgba(96,88,53,0.34),transparent_22rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

      <div className="relative z-10 flex h-full flex-col">
        <Header />
        <section id="home" className="grid flex-1 place-items-center">
          <div id="globe">
            <VisitorGlobe />
          </div>
        </section>
      </div>
    </main>
  );
}
