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
  // ====== ESTADO GERAL ======
  const [cias, setCias] = useState<CiaMap>({});
  const [cia, setCia] = useState("");
  const [pontos, setPontos] = useState("");
  const [whatsLocal, setWhatsLocal] = useState(""); // DDD+Número (sem 55)
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // vendor (número do atendente) — usado só no botão do modal
  const [vendorWhats, setVendorWhats] = useState<string | null>(null);

  // modal da cotação
  const [openQuote, setOpenQuote] = useState(false);

  // ====== EFEITOS INICIAIS ======
  useEffect(() => {
    (async () => {
      try {
        // cias
        const r = await fetch("/api/cias", { cache: "no-store" });
        const data = (await r.json()) as CiaMap;
        if (data && typeof data === "object") {
          setCias(data);
          const first = Object.keys(data)[0];
          if (first) setCia(first);
        } else {
          setCias({});
        }
      } catch {
        setCias({});
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/public-config", { cache: "no-store" });
        const data = await r.json().catch(() => ({}));
        setVendorWhats(data?.vendorWhats || null);
      } catch {
        setVendorWhats(null);
      }
    })();
  }, []);

  // ====== DERIVADOS ======
  const cpm = useMemo(() => (cia ? cias[cia] ?? 0 : 0), [cia, cias]);
  const pontosNum = useMemo(() => Number(onlyDigits(pontos) || 0), [pontos]);
  const valor = useMemo(() => (pontosNum / 1000) * (cpm || 0), [pontosNum, cpm]);

  // ====== AÇÕES ======
  function validarCamposBasicos(): string | null {
    const whatsDigits = onlyDigits(whatsLocal); // DDD+Número
    if (!cia) return "Selecione a companhia aérea.";
    if (!pontosNum || pontosNum < 1000)
      return "Informe a quantidade de pontos (mínimo 1.000).";
    if (!/^\d{10,11}$/.test(whatsDigits))
      return "WhatsApp deve ser DDD+Número (10 ou 11 dígitos).";
    if (!email.includes("@")) return "Informe um e-mail válido.";
    return null;
  }

  async function handleShowQuote(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const erro = validarCamposBasicos();
    if (erro) {
      setMsg(erro);
      return;
    }

    // 🔹 Envia os dados do lead para a API interna (server) -> Make
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cia,
          pontos: pontosNum,
          whatsapp: onlyDigits(whatsLocal), // só dígitos (sem +55)
          email,
          valor, // já calculado
          cpm,
        }),
      });
    } catch {
      // Falha no envio não impede o usuário de ver a cotação
    }

    // 🔹 Abre o modal com a cotação
    setOpenQuote(true);
  }

  function handleWhatsContinue() {
    // valida de novo o básico
    const erro = validarCamposBasicos();
    if (erro) {
      setMsg(erro);
      return;
    }
    // precisa do número do atendente
    if (!vendorWhats) {
      setMsg("Número do vendedor não configurado na Vercel.");
      return;
    }

    const to = `55${onlyDigits(whatsLocal)}`;
    const texto = `✈️ *Aba Milhas* — sua cotação chegou!
• Companhia: ${cia}
• Pontos: ${pontosNum.toLocaleString("pt-BR")}
• E-mail: ${email}
• Valor estimado: ${brl(valor)} (CPM R$ ${cpm})

👉 Para continuar a negociação, acesse: ${CONTINUE_URL}

(_Mensagem gerada automaticamente a partir do site_)`;

    const url = `https://wa.me/${vendorWhats}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ====== UI ======
  return (
    <main className="min-h-dvh bg-neutral-50">
      {/* REMOVIDO: cabeçalho duplicado com logo/descrição.
          O header principal está no layout.tsx e permanece. */}

      <section className="mx-auto max-w-6xl px-6 py-10 grid md:grid-cols-2 gap-8">
        {/* Texto lateral esquerdo — NOVO BLOCO */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#004c56]">
            Receba sua cotação em segundos
          </h1>

          <p className="text-neutral-700 leading-relaxed">
            Informe seus dados e visualize, em poucos segundos, o{" "}
            <strong>valor estimado</strong> das suas milhas. Se fizer sentido
            para você, continue a negociação pelo WhatsApp e conclua com
            segurança. Atendimento <strong>humanizado</strong>, cálculo{" "}
            <strong>transparente</strong> e pagamento ágil.
          </p>

          <ul className="mt-2 space-y-2 text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="mt-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                ✓
              </span>
              <span>Suporte <strong>humanizado</strong> por especialistas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                ✓
              </span>
              <span>
                Pagamento <strong>rápido e seguro</strong>: em até{" "}
                <strong>25h</strong> (máx. <strong>48h</strong>) após a emissão.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                ✓
              </span>
              <span>
                <strong>Sem compromisso</strong>: você decide se quer prosseguir.
              </span>
            </li>
          </ul>
        </div>

        {/* Painel “Sua cotação” */}
        <aside className="order-first md:order-last">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-neutral-800">Sua cotação</h2>
              <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
                estimativa
              </span>
            </div>
            <p className="text-neutral-700">
              Preencha o formulário ao lado e clique em{" "}
              <strong>“Ver minha cotação”</strong>. Sua estimativa aparece em uma
              janela.
            </p>
          </div>
        </aside>

        {/* Formulário */}
        <form
          onSubmit={handleShowQuote}
          className="bg-white rounded-2xl shadow p-6 space-y-4"
        >
          {/* Cia aérea */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Companhia aérea
            </label>
            <select
              value={cia}
              onChange={(e) => setCia(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            >
              {!Object.keys(cias).length && <option value="">Carregando…</option>}
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
              onChange={(e) => setPontos(onlyDigits(e.target.value))}
              placeholder="Ex.: 100000"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Mínimo recomendado: 1.000 pontos.
            </p>
          </div>

          {/* WhatsApp (Brasil fixo) */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              WhatsApp
            </label>
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
            <label className="block text-sm font-medium text-neutral-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                msg.startsWith("Número do vendedor")
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {msg}
            </div>
          )}
        </form>
      </section>

      {/* MODAL DE COTAÇÃO */}
      {openQuote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-neutral-900">
                Sua cotação
              </h3>
              <button
                className="text-neutral-500 hover:text-neutral-800"
                onClick={() => setOpenQuote(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 text-neutral-800">
              <p>
                <strong>Companhia:</strong> {cia || "—"}
              </p>
              <p>
                <strong>Pontos:</strong> {pontosNum.toLocaleString("pt-BR")}
              </p>
              <p>
                <strong>CPM:</strong> R$ {cpm}
              </p>
              <p className="text-lg">
                <strong>Valor estimado:</strong> {brl(valor)}
              </p>
              <p className="text-sm text-neutral-600">
                Essa é uma estimativa. O preço final pode variar conforme regras
                do programa e disponibilidade.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleWhatsContinue}
                className="rounded-xl bg-[#25D366] text-white font-semibold py-3 hover:brightness-105 transition"
              >
                Continuar pelo WhatsApp
              </button>
              <button
                onClick={() => setOpenQuote(false)}
                className="rounded-xl border border-neutral-300 bg-white py-3 font-semibold text-neutral-800 hover:bg-neutral-50 transition"
              >
                Fechar
              </button>
            </div>

            {/* Mensagens no modal (ex.: vendedor não configurado) */}
            {msg && (
              <div className="mt-3 text-sm rounded-xl px-3 py-2 bg-red-50 text-red-700">
                {msg}
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Aba Milhas. Todos os direitos reservados.
      </footer>
    </main>
  );
}
