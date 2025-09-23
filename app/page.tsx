"use client";

import React, { useEffect, useMemo, useState } from "react";

type CiaMap = Record<string, number>;

const SELLER = process.env.NEXT_PUBLIC_WA_SELLER || ""; // ex.: 5551999999999

// utils
const onlyDigits = (s: string) => s.replace(/[^\d]/g, "");
const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Page() {
  // dados de cálculo
  const [cias, setCias] = useState<CiaMap>({});
  const [cia, setCia] = useState("");
  const [pontos, setPontos] = useState("");
  const [whatsLocal, setWhatsLocal] = useState(""); // DDD+Número sem +55
  const [email, setEmail] = useState("");

  // UI
  const [showQuote, setShowQuote] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/cias", { cache: "no-store" });
        const data = (await r.json()) as CiaMap;
        setCias(data);
        const first = Object.keys(data)[0];
        if (first) setCia(first);
      } catch {
        setCias({});
      }
    })();
  }, []);

  const cpm = useMemo(() => (cia ? cias[cia] ?? 0 : 0), [cia, cias]);
  const pontosNum = useMemo(() => Number(onlyDigits(pontos) || 0), [pontos]);
  const valor = useMemo(() => (pontosNum / 1000) * (cpm || 0), [pontosNum, cpm]);

  // texto que vai para o WhatsApp do vendedor
  const sellerMessage = useMemo(() => {
    const lines = [
      "✈️ *Aba Milhas* — Novo pedido de cotação",
      `• Companhia: ${cia || "-"}`,
      `• Pontos: ${pontosNum.toLocaleString("pt-BR") || "-"}`,
      `• E-mail do cliente: ${email || "-"}`,
      `• WhatsApp do cliente: +55 ${whatsLocal || "-"}`,
      `• Valor estimado: ${brl(valor)} (CPM R$ ${cpm})`,
      "",
      "👉 Vamos continuar com a negociação?"
    ];
    return lines.join("\n");
  }, [cia, pontosNum, email, whatsLocal, valor, cpm]);

  const waLink = useMemo(() => {
    // conversa com o *seu número* (vendedor)
    const base = `https://wa.me/${SELLER}?text=${encodeURIComponent(
      sellerMessage
    )}`;
    return base;
  }, [sellerMessage]);

  function validate(): string | null {
    if (!cia) return "Selecione a companhia aérea.";
    if (!pontosNum || pontosNum < 1000)
      return "Informe a quantidade de pontos (mínimo 1.000).";
    const dddNum = onlyDigits(whatsLocal);
    if (!/^\d{10,11}$/.test(dddNum))
      return "WhatsApp deve ser DDD+Número (10 ou 11 dígitos).";
    if (!email.includes("@")) return "Informe um e-mail válido.";
    if (!SELLER) return "Número do vendedor não configurado na Vercel.";
    return null;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    setMsg(err);
    if (!err) setShowQuote(true);
  }

  function copyQuote() {
    navigator.clipboard
      .writeText(sellerMessage)
      .then(() => setMsg("✅ Cotação copiada!"))
      .catch(() => setMsg("❌ Não foi possível copiar."));
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      {/* Cabeçalho simples */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          <img src="/logo.png" alt="Aba Milhas" className="h-10 w-auto" />
          <div className="text-neutral-700">
            <div className="font-semibold">Aba Milhas</div>
            <div className="text-sm">Compra e venda de milhas com segurança</div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10 grid lg:grid-cols-2 gap-8">
        {/* Texto de apoio */}
        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-[#004c56]">
            Receba sua cotação em segundos
          </h1>
          <p className="text-neutral-700 leading-relaxed">
            Preencha os dados, veja o valor estimado agora mesmo e, se quiser,
            continue a negociação pelo WhatsApp. Atendimento{" "}
            <strong>humanizado</strong> e pagamento{" "}
            <strong>rápido e seguro</strong> entre{" "}
            <strong>25h e até 48h</strong> após a emissão.
          </p>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl shadow p-6 space-y-4"
          >
            {/* Companhia */}
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Companhia aérea
              </label>
              <select
                value={cia}
                onChange={(e) => {
                  setCia(e.target.value);
                  setShowQuote(false);
                  setMsg(null);
                }}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
                required
              >
                {!Object.keys(cias).length && (
                  <option value="">Carregando...</option>
                )}
                {Object.keys(cias).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Pontos */}
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Quantidade de pontos
              </label>
              <input
                inputMode="numeric"
                value={pontos}
                onChange={(e) => {
                  setPontos(onlyDigits(e.target.value));
                  setShowQuote(false);
                  setMsg(null);
                }}
                placeholder="Ex.: 100000"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Mínimo recomendado: 1.000 pontos.
              </p>
            </div>

            {/* WhatsApp (obrigatório) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                WhatsApp do cliente (Brasil)
              </label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-xl border border-neutral-300 bg-neutral-50 px-3 text-neutral-700">
                  +55
                </span>
                <input
                  inputMode="numeric"
                  value={whatsLocal}
                  onChange={(e) => {
                    setWhatsLocal(onlyDigits(e.target.value));
                    setShowQuote(false);
                    setMsg(null);
                  }}
                  placeholder="DDD+Número (ex.: 11999999999)"
                  className="w-full rounded-r-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Digite apenas DDD+Número (10 ou 11 dígitos). O +55 já está fixo.
              </p>
            </div>

            {/* E-mail (obrigatório) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                E-mail do cliente
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setShowQuote(false);
                  setMsg(null);
                }}
                placeholder="voce@exemplo.com"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
                required
              />
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#004c56] text-white font-semibold py-3 hover:bg-[#00636f] transition"
            >
              Ver minha cotação
            </button>

            {msg && (
              <div
                className={`text-sm rounded-xl px-3 py-2 ${
                  msg.startsWith("✅")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {msg}
              </div>
            )}
          </form>
        </div>

        {/* Cartão de cotação */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-800">
                Sua cotação
              </h2>
              <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">
                estimativa
              </span>
            </div>

            {/* Estado inicial */}
            {!showQuote ? (
              <div className="text-neutral-600">
                Preencha o formulário ao lado e clique em{" "}
                <strong>“Ver minha cotação”</strong>. Sua estimativa aparece
                aqui.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">Companhia</div>
                    <div className="font-semibold">{cia}</div>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">CPM</div>
                    <div className="font-semibold">R$ {cpm}</div>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">Pontos</div>
                    <div className="font-semibold">
                      {pontosNum.toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">
                      Valor estimado
                    </div>
                    <div className="text-xl font-bold text-[#0f766e]">
                      {brl(valor)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center rounded-xl bg-[#25D366] text-white font-semibold py-3 hover:brightness-95 transition"
                  >
                    Continuar no WhatsApp
                  </a>

                  <button
                    onClick={copyQuote}
                    className="rounded-xl border border-neutral-300 bg-white text-neutral-800 font-semibold py-3 hover:bg-neutral-50 transition"
                  >
                    Copiar resumo da cotação
                  </button>
                </div>

                <p className="text-xs text-neutral-500 mt-4">
                  *Estimativa baseada no CPM informado. O valor final pode variar
                  após validação.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Aba Milhas. Todos os direitos reservados.
      </footer>
    </main>
  );
}

