"use client";

import React, { useEffect, useMemo, useState } from "react";

type CiaMap = Record<string, number>;

const CONTINUE_URL =
  process.env.NEXT_PUBLIC_CONTINUE_URL || "https://abamilhas.com.br/continuar";

function onlyDigits(s: string) {
  return s.replace(/[^\d]/g, "");
}
function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Page() {
  const [cias, setCias] = useState<CiaMap>({});
  const [cia, setCia] = useState("");
  const [pontos, setPontos] = useState("");
  const [whatsLocal, setWhatsLocal] = useState(""); // DDD+Número (sem 55)
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/cias", { cache: "no-store" });
        const data = (await r.json()) as CiaMap;
        if (data && typeof data === "object") {
          setCias(data);
          const first = Object.keys(data)[0];
          if (first) setCia(first);
        }
      } catch {
        setCias({});
      }
    })();
  }, []);

  const cpm = useMemo(() => (cia ? cias[cia] ?? 0 : 0), [cia, cias]);
  const pontosNum = useMemo(() => Number(onlyDigits(pontos) || 0), [pontos]);
  const valor = useMemo(() => (pontosNum / 1000) * (cpm || 0), [pontosNum, cpm]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const whatsDigits = onlyDigits(whatsLocal); // DDD+Número
    if (!cia) return setMsg("Selecione a companhia aérea.");
    if (!pontosNum || pontosNum < 1000)
      return setMsg("Informe a quantidade de pontos (mínimo 1.000).");
    if (!/^\d{10,11}$/.test(whatsDigits))
      return setMsg("WhatsApp deve ser DDD+Número (10 ou 11 dígitos).");
    if (!email.includes("@")) return setMsg("Informe um e-mail válido.");

    // BR fixo (adiciona +55 automaticamente)
    const to = `55${whatsDigits}`;

    // Valor NÃO aparece na página — apenas na mensagem enviada
    const texto = `✈️ *Aba Milhas* — sua cotação chegou!
• Companhia: ${cia}
• Pontos: ${pontosNum.toLocaleString("pt-BR")}
• E-mail: ${email}
• Valor estimado: ${brl(valor)} (CPM R$ ${cpm})

👉 Para continuar a negociação, acesse: ${CONTINUE_URL}`;

    try {
      setEnviando(true);
      const r = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, body: texto }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data?.ok !== false) {
        setMsg("✅ Cotação enviada no seu WhatsApp!");
        setEmail("");
        setWhatsLocal("");
        setPontos("");
      } else {
        setMsg("❌ Não foi possível enviar no WhatsApp. Verifique o token na Vercel.");
      }
    } catch {
      setMsg("❌ Erro de rede. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          {/* CORREÇÃO AQUI: usa /logo.png */}
          <img src="/logo.png" alt="Aba Milhas" className="h-12 w-auto" />
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
            Preencha os dados. Calculamos o valor e enviamos no seu WhatsApp com um link para continuar.
          </p>
          <ul className="text-neutral-700 list-disc pl-5 space-y-1">
            <li>Principais cias aéreas</li>
            <li>Pagamento rápido e seguro</li>
            <li>Sem compromisso</li>
          </ul>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
          {/* Cia aérea */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">Companhia aérea</label>
            <select
              value={cia}
              onChange={(e) => setCia(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            >
              {!Object.keys(cias).length && <option value="">Carregando...</option>}
              {Object.keys(cias).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Pontos */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">Quantidade de pontos</label>
            <input
              inputMode="numeric"
              value={pontos}
              onChange={(e) => setPontos(onlyDigits(e.target.value))}
              placeholder="Ex.: 100000"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">Mínimo recomendado: 1.000 pontos.</p>
          </div>

          {/* WhatsApp (Brasil fixo) */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">WhatsApp (Brasil)</label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center rounded-l-xl border border-neutral-300 bg-neutral-50 px-3 text-neutral-700">
                +55
              </span>
              <input
                inputMode="numeric"
                value={whatsLocal}
                onChange={(e) => setWhatsLocal(onlyDigits(e.target.value))}
                placeholder="DDD+Número (ex.: 11999999999)"
                className="w-full rounded-r-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
                required
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Digite apenas DDD+Número (10 ou 11 dígitos). O +55 já está fixo.
            </p>
          </div>

          {/* E-mail */}
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

          {/* Botão */}
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

