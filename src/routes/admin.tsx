import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ADMIN_PASS, ADMIN_USER, CATEGORIES, DEFAULT_PRODUCTS, eur, isAdmin, loadProducts, saveProducts, setAdmin, type Product } from "@/lib/farm-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Nadzorna plošča — Kmetija pri Cvarovih" },
      { name: "description", content: "Upravljanje izdelkov in slik spletne trgovine kmetije pri Cvarovih." },
      { property: "og:title", content: "Nadzorna plošča — pri Cvarovih" },
      { property: "og:description", content: "Prijava za upravljanje ponudbe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const field = "rounded-md border border-input bg-background px-3 py-2";

function Admin() {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => setOk(isAdmin()), []);

  if (!ok)
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary px-4 font-sans">
        <form
          className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-warm"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (f.get("user") === ADMIN_USER && f.get("pass") === ADMIN_PASS) {
              setAdmin(true);
              setOk(true);
            } else setErr("Napačno uporabniško ime ali geslo.");
          }}
        >
          <h1 className="font-display text-3xl text-primary">Nadzorna plošča</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kmetija pri Cvarovih</p>
          <label className="mt-6 block text-sm">Uporabniško ime<input name="user" required autoComplete="username" className={`${field} mt-1 w-full`} /></label>
          <label className="mt-4 block text-sm">Geslo<input name="pass" type="password" required autoComplete="current-password" className={`${field} mt-1 w-full`} /></label>
          {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
          <button className="mt-6 w-full rounded-full bg-primary py-3 text-primary-foreground">Prijava</button>
          <Link to="/" className="mt-4 block text-center text-sm text-muted-foreground">← Nazaj v trgovino</Link>
        </form>
      </div>
    );
  return <Dashboard onLogout={() => { setAdmin(false); setOk(false); }} />;
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [items, setItems] = useState<Product[]>([]);
  const [edit, setEdit] = useState<Product | null>(null);
  const [img, setImg] = useState("");
  useEffect(() => setItems(loadProducts()), []);

  const persist = (p: Product[]) => {
    setItems(p);
    try {
      saveProducts(p);
    } catch {
      alert("Slika je prevelika za shranjevanje v brskalnik. Izberite manjšo.");
    }
  };

  const readFile = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setImg(String(r.result));
    r.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="font-display text-2xl text-primary">Nadzorna plošča</h1>
        <div className="flex gap-4 text-sm">
          <Link to="/">Trgovina</Link>
          <button onClick={() => confirm("Ponastavim na vzorčne izdelke?") && persist(DEFAULT_PRODUCTS)}>Ponastavi</button>
          <button onClick={onLogout} className="text-destructive">Odjava</button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[380px_1fr]">
        <form
          key={edit?.id ?? "new"}
          className="flex h-fit flex-col gap-3 rounded-2xl border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const p: Product = {
              id: edit?.id ?? crypto.randomUUID(),
              name: String(f.get("name")),
              category: String(f.get("category")),
              price: Number(f.get("price")),
              unit: String(f.get("unit")),
              description: String(f.get("description")),
              image: img || edit?.image || "",
            };
            persist(edit ? items.map((i) => (i.id === p.id ? p : i)) : [p, ...items]);
            setEdit(null);
            setImg("");
            e.currentTarget.reset();
          }}
        >
          <h2 className="font-display text-xl">{edit ? "Uredi izdelek" : "Nov izdelek"}</h2>
          <input name="name" required placeholder="Naziv" defaultValue={edit?.name} className={field} />
          <select name="category" defaultValue={edit?.category ?? CATEGORIES[0]} className={field}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <input name="price" type="number" step="0.01" min="0" required placeholder="Cena €" defaultValue={edit?.price} className={`${field} w-1/2`} />
            <input name="unit" required placeholder="Enota (kg, kos)" defaultValue={edit?.unit} className={`${field} w-1/2`} />
          </div>
          <textarea name="description" rows={3} placeholder="Opis" defaultValue={edit?.description} className={field} />
          <label className="text-sm">Slika<input type="file" accept="image/*" onChange={(e) => readFile(e.target.files?.[0])} className="mt-1 block text-sm" /></label>
          {(img || edit?.image) && <img src={img || edit?.image} alt="" className="h-32 w-full rounded-lg object-cover" />}
          <button className="rounded-full bg-primary py-2 text-primary-foreground">{edit ? "Shrani" : "Dodaj"}</button>
          {edit && <button type="button" onClick={() => { setEdit(null); setImg(""); }} className="text-sm text-muted-foreground">Prekliči</button>}
        </form>

        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr><th className="py-2">Izdelek</th><th>Kategorija</th><th>Cena</th><th /></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="flex items-center gap-3 py-3"><img src={p.image} alt="" className="h-12 w-12 rounded-md object-cover" />{p.name}</td>
                <td>{p.category}</td>
                <td>{eur(p.price)} / {p.unit}</td>
                <td className="space-x-3 text-right">
                  <button onClick={() => { setEdit(p); setImg(""); }} className="text-primary">Uredi</button>
                  <button onClick={() => confirm(`Izbrišem ${p.name}?`) && persist(items.filter((i) => i.id !== p.id))} className="text-destructive">Izbriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
