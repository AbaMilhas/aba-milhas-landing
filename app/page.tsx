"use client";

import React, { useEffect, useState } from "react";

// Aceita vários formatos vindos do /api/cias
type CiasApi =
  | string[]
  | { cias: string[] }
  | Record<string, number>; // ex: { LATAM: 25, Smiles: 15.5 }

function normalizaCias(input: CiasApi): string[] {
  // 1) { cias: [...] }
  if (input && typeof input === "object" && "cias" in input) {
    const arr = (input as { cias: unknown }).cias;
    if (Array.isArray(arr)) return arr.map(String);
  }
  // 2) array simples [...]
  if (Array.isArray(input)) return input.map(String);
  // 3) mapa { LATAM: 25, ... } -> pega as chaves
  if (input && typeof input === "object") return Object.keys(input as object);
  return [];
}

export default function Page() {
  const [cias, setCias] = useState<string[]>([]);
  const [cia, setCia] = useState("");
  const [milhas, setMilhas] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/cias", { cache: "no-store" });
        const raw = (await r.json()) as CiasApi;
        const lista = normalizaCias(raw);
        setCias(lista);
        if (lista[0]) setCia(lista[0]);
      } catch {
        setCias([]);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const milhasNum = Number(milhas.replace(/\D/g, ""));
    if (!cia) return setMsg("Selecione a companhia.");
    if (!milhasNum) return setMsg("Informe a quantidade de milhas.");
    if (!/^\d{11,13}$/.test(whatsapp))
      return setMsg("WhatsApp deve ser DDI+DDD+Número. Ex.: 5591999999999");

    const mensagem =
      `✈️ *Aba Milhas* — nova cotação\n\n` +
      `• Companhia: ${cia}\n` +
      `• Milhas: ${milhasNum.toLocaleString("pt-BR")}\n` +
      `• E-mail: ${email}\n` +
      `• WhatsApp: ${whatsapp}`;

    try {
      setEnviando(true);
      const r = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: mensagem }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data?.ok !== false) {
        setMsg("✅ Cotação enviada no WhatsApp!");
        // mantém cia/milhas para facilitar outro envio
        setEmail("");
        // setWhatsapp(""); // opcional
      } else {
        setMsg("❌ Falha ao enviar. Verifique token/variáveis na Vercel.");
      }
    } catch (err) {
      setMsg("❌ Erro de rede. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          <img src="/logo-aba.png" alt="Aba Milhas" className="h-12 w-auto" />
          <div className="text-neutral-700">
            <div className="font-semibold">Aba Milhas</div>
            <div className="text-sm">Compra e venda de milhas com segurança</div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#004c56]">
            Receba a cotação das suas milhas por WhatsApp
          </h1>
          <p className="text-neutral-700">
            Preencha os dados e enviamos automaticamente sua cotação no WhatsApp.
          </p>
          <ul className="text-neutral-700 list-disc pl-5 space-y-1">
            <li>Atendemos principais cias aéreas</li>
            <li>Pagamento rápido e seguro</li>
            <li>Sem compromisso — você decide se quer negociar</li>
          </ul>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Companhia aérea</label>
            <select
              value={cia}
              onChange={(e) => setCia(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            >
              {!cias.length && <option value="">Carregando...</option>}
              {cias.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">Quantidade de milhas</label>
            <input
              inputMode="numeric"
              value={milhas}
              onChange={(e) => setMilhas(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Ex.: 100000"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">WhatsApp (DDI+DDD+Número)</label>
            <input
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Ex.: 5591999999999"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Ex.: Brasil → 55 + DDD + número.
            </p>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-[#004c56] text-white font-semibold py-3 hover:bg-[#00636f] transition disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Receber cotação no WhatsApp"}
          </button>

          {msg && (
            <div
              className={`text-sm rounded-xl px-3 py-2 ${
                msg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {msg}
            </div>
          )}
        </form>
      </section>

      <footer className="py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Aba Milhas. Todos os direitos reservados.
      </footer>
    </main>
  );
}

