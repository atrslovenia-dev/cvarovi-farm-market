import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import hero from "@/assets/hero.jpg";
import { CATEGORIES, eur, loadCart, loadProducts, saveCart, type CartLine, type Product } from "@/lib/farm-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kmetija pri Cvarovih — domači pridelki in kmetijsko blago" },
      { name: "description", content: "Spletna trgovina kmetije pri Cvarovih: pridelki, meso, les, gnojila, sadike, semena, orodja, stroji, objekti in oprema." },
      { property: "og:title", content: "Kmetija pri Cvarovih" },
      { property: "og:description", content: "Domače iz slovenske kmetije — naročite neposredno pri kmetu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cat, setCat] = useState<string>("Vse");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setProducts(loadProducts());
    setCart(loadCart());
  }, []);

  const update = (c: CartLine[]) => {
    setCart(c);
    saveCart(c);
  };
  const add = (id: string) => {
    const ex = cart.find((l) => l.id === id);
    update(ex ? cart.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...cart, { id, qty: 1 }]);
  };
  const setQty = (id: string, qty: number) => update(qty <= 0 ? cart.filter((l) => l.id !== id) : cart.map((l) => (l.id === id ? { ...l, qty } : l)));

  const lines = cart.map((l) => ({ ...l, p: products.find((p) => p.id === l.id) })).filter((l) => l.p) as (CartLine & { p: Product })[];
  const total = lines.reduce((s, l) => s + l.qty * l.p.price, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const shown = useMemo(() => (cat === "Vse" ? products : products.filter((p) => p.category === cat)), [products, cat]);

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="font-display text-2xl font-semibold text-primary">pri Cvarovih</a>
          <div className="flex items-center gap-6 text-sm">
            <a href="#ponudba" className="hover:text-primary">Ponudba</a>
            <Link to="/admin" className="hover:text-primary">Nadzorna plošča</Link>
            <button popoverTarget="kosarica" className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground">
              Košarica · {count}
            </button>
          </div>
        </nav>
      </header>

      <section className="relative h-[82vh] min-h-[520px] overflow-hidden">
        <img src={hero} alt="Kmetija pri Cvarovih s kozolcem in Alpami" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 text-primary-foreground">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent">Od leta 1887 · Slovenija</p>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.05] md:text-7xl">Domače, pošteno in s srcem — iz kmetije pri Cvarovih.</h1>
          <p className="mt-6 max-w-xl text-lg opacity-90">Od krompirja do traktorja: vse, kar kmetija pridela in potrebuje, na enem mestu.</p>
          <a href="#ponudba" className="mt-8 w-fit rounded-full bg-accent px-8 py-4 font-medium text-accent-foreground shadow-warm transition hover:scale-105">Oglejte si ponudbo</a>
        </div>
      </section>

      <main id="ponudba" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-4xl font-semibold">Naša ponudba</h2>
        <div className="mt-8 flex flex-wrap gap-2">
          {["Vse", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-2 text-sm transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}>{c}</button>
          ))}
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <article key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-warm">
              <div className="aspect-[4/3] overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary text-center text-sm text-muted-foreground">Brez slike</div>
                )}
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</p>
                <h3 className="mt-1 font-display text-2xl">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">{eur(p.price)} <span className="text-sm font-normal text-muted-foreground">/ {p.unit}</span></span>
                  <button onClick={() => add(p.id)} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">V košarico</button>
                </div>
              </div>
            </article>
          ))}
          {shown.length === 0 && <p className="text-muted-foreground">V tej kategoriji trenutno ni izdelkov.</p>}
        </div>
      </main>

      <footer className="bg-primary px-6 py-12 text-primary-foreground">
        <div className="mx-auto max-w-7xl">
          <p className="font-display text-2xl">Kmetija pri Cvarovih</p>
          <p className="mt-2 opacity-80">Prevzem na kmetiji ali dostava po dogovoru.</p>
        </div>
      </footer>

      {/* Native HTML popover cart */}
      <div id="kosarica" popover="auto" className="m-0 ml-auto h-full max-h-none w-full max-w-md border-l border-border bg-card p-6 text-card-foreground">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Košarica</h2>
          <button popoverTarget="kosarica" popoverTargetAction="hide" aria-label="Zapri" className="text-2xl">×</button>
        </div>
        {sent ? (
          <p className="mt-8 text-primary">Hvala! Vaše naročilo smo prejeli in vas kmalu kontaktiramo.</p>
        ) : lines.length === 0 ? (
          <p className="mt-8 text-muted-foreground">Košarica je prazna.</p>
        ) : (
          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              update([]);
              setSent(true);
            }}
          >
            {lines.map((l) => (
              <div key={l.id} className="flex items-center gap-3 border-b border-border pb-3">
                <img src={l.p.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{l.p.name}</p>
                  <p className="text-sm text-muted-foreground">{eur(l.p.price)} / {l.p.unit}</p>
                </div>
                <input type="number" min={0} value={l.qty} onChange={(e) => setQty(l.id, Number(e.target.value))} className="w-16 rounded-md border border-input bg-background px-2 py-1" aria-label="Količina" />
              </div>
            ))}
            <p className="flex justify-between text-lg font-semibold"><span>Skupaj</span><span>{eur(total)}</span></p>
            <input required name="ime" placeholder="Ime in priimek" autoComplete="name" className="rounded-md border border-input bg-background px-3 py-2" />
            <input required type="email" name="email" placeholder="E-pošta" autoComplete="email" className="rounded-md border border-input bg-background px-3 py-2" />
            <input required type="tel" name="tel" placeholder="Telefon" autoComplete="tel" className="rounded-md border border-input bg-background px-3 py-2" />
            <button className="rounded-full bg-accent py-3 font-medium text-accent-foreground">Oddaj naročilo</button>
          </form>
        )}
      </div>
    </div>
  );
}
