import meat from "@/assets/meat.jpg";
import i_krompir from "@/assets/p-krompir.jpg";
import i_jabolka from "@/assets/p-jabolka.jpg";
import i_zelje from "@/assets/p-zelje.jpg";
import i_prsut from "@/assets/p-prsut.jpg";
import i_med from "@/assets/p-med.jpg";
import i_drva from "@/assets/p-drva.jpg";
import i_gnoj from "@/assets/p-gnoj.jpg";
import i_sadike from "@/assets/p-sadike.jpg";
import i_semena from "@/assets/p-semena.jpg";
import i_motika from "@/assets/p-motika.jpg";
import i_traktor from "@/assets/p-traktor.jpg";
import i_kozolec from "@/assets/p-kozolec.jpg";
import i_samokolnica from "@/assets/p-samokolnica.jpg";

export const CATEGORIES = [
  "Kmetijski pridelki",
  "Meso in živilski izdelki",
  "Les",
  "Gnojila",
  "Sadike",
  "Semena",
  "Orodja",
  "Kmetijski stroji",
  "Kmetijski objekti",
  "Kmetijska oprema",
] as const;

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  image: string;
};

export type CartLine = { id: string; qty: number };

const P = (id: string, name: string, category: string, price: number, unit: string, description: string, image: string): Product => ({ id, name, category, price, unit, description, image });

export const DEFAULT_PRODUCTS: Product[] = [
  P("p1", "Domači krompir", CATEGORIES[0], 1.2, "kg", "Gorenjski krompir, ročno pobran.", i_krompir),
  P("p2", "Jabolka idared", CATEGORIES[0], 1.5, "kg", "Sočna jabolka iz našega sadovnjaka.", i_jabolka),
  P("p3", "Kislo zelje", CATEGORIES[0], 2.4, "kg", "Naravno kisano v lesenih kadeh.", i_zelje),
  P("p4", "Kranjska klobasa", CATEGORIES[1], 14.9, "kg", "Po tradicionalnem receptu, domače meso.", meat),
  P("p5", "Kraški pršut", CATEGORIES[1], 32, "kg", "Zorjen 18 mesecev.", i_prsut),
  P("p6", "Cvetlični med", CATEGORIES[1], 9, "kozarec", "Med naših čebel, 900 g.", i_med),
  P("p7", "Bukova drva", CATEGORIES[2], 85, "m³", "Suha, razžagana na 33 cm.", i_drva),
  P("p8", "Organski hlevski gnoj", CATEGORIES[3], 6.5, "vreča", "Uležan, 40 l vreča.", i_gnoj),
  P("p9", "Sadike paradižnika", CATEGORIES[4], 0.9, "kos", "Krepke sadike domačih sort.", i_sadike),
  P("p10", "Seme fižola ribničan", CATEGORIES[5], 3.5, "zavitek", "Avtohtona slovenska sorta.", i_semena),
  P("p11", "Kovana motika", CATEGORIES[6], 24, "kos", "Ročno kovana, lesen ročaj.", i_motika),
  P("p12", "Traktor (rabljen)", CATEGORIES[7], 28500, "kos", "Dobro ohranjen, 4x4, servisiran.", i_traktor),
  P("p13", "Lesen kozolec", CATEGORIES[8], 12000, "kos", "Tradicionalni toplar, izdelava po meri.", i_kozolec),
  P("p14", "Samokolnica", CATEGORIES[9], 79, "kos", "Pocinkana, 100 l.", i_samokolnica),
];

const PK = "cvar_products_v2";
const CK = "cvar_cart";
const AK = "cvar_admin";

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PK);
    return raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}
export function saveProducts(p: Product[]) {
  localStorage.setItem(PK, JSON.stringify(p));
}
export function loadCart(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem(CK) || "[]");
  } catch {
    return [];
  }
}
export function saveCart(c: CartLine[]) {
  localStorage.setItem(CK, JSON.stringify(c));
}

// Hardcoded admin credentials (as requested)
export const ADMIN_USER = "cvar";
export const ADMIN_PASS = "kmetija2026";
export const isAdmin = () => sessionStorage.getItem(AK) === "1";
export const setAdmin = (v: boolean) => (v ? sessionStorage.setItem(AK, "1") : sessionStorage.removeItem(AK));

export const eur = (n: number) => new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" }).format(n);
