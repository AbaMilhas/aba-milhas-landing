"use client";

import React, { useEffect, useMemo, useState } from "react";

type CiaMap = Record<string, number>;

function onlyDigits(s: string) {
  return s.replace(/[^\d]/g, "");
}
function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const WA_SELLER = process.env.NEXT_PUBLIC_WA_SELLER || ""; // seu número de atendimento

export default function Page() {
  const [cias, setCias] = useState<CiaMap>({});
  const [cia, setCia] = useState("");
  const [pontos, setPontos] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [resultadoVisivel, setResultadoVisivel] = useState(false);

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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cia) return alert("Selecione a companhia aérea.");
    if (!pontosNum || pontosNum < 1000)
      return alert("Informe a quantidade de pontos (mínimo 1.000).");

    setResultadoVisivel(true);
  }

  // Mensagem que vai pré-preenchida no WhatsApp (para o SEU número)
  const mensagemWhats = useMemo(() => {
    const linhas = [
      `✈️ *Aba Milhas* — Nova cotação`,
      nome ? `• Nome: ${nome}` : null,
      `• Companhia: ${cia}`,
      `• Pontos: ${pontosNum.toLocaleString("pt-BR")}`,
      email ? `• E-mail: ${email}` : null,
      `• Valor estimado: ${brl(valor)} (CPM R$ ${cpm})`,
      ``,
      `Tenho interesse em continuar a negociação 👇`,
    ].filter(Boolean);
    return linhas.join("\n");
  }, [cia, pontosNum, valor, cpm, nome, email]);

  // Link wa.me para abrir conversa com a SUA empresa
  const waLink = useMemo(() => {
    const num = onlyDigits(WA_SELLER);
    const texto = encodeURIComponent(mensagemWhats);
    return num ? `https://wa.me/${num}?text=${texto}` : "#";
  }, [mensagemWhats]);

  return (
    <main className="min-h-dvh bg-neutral-50">
      <section className="mx-auto max-w-5xl px-6 py-10 grid md:grid-cols-2 gap-8">
        {/* Lado esquerdo: copy */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#004c56]">
            Receba sua cotação em segundos 🚀
          </h1>
          <p className="text-neutral-700">
            Preencha os dados, veja o valor estimado na hora e, se quiser,
            continue a negociação no WhatsApp com nosso time.
          </p>
          <ul className="text-neutral-700 list-disc pl-5 space-y-1">
            <li>🤝 Suporte humanizado em todas as etapas</li>
            <li>💸 Pagamento seguro entre 25h e até 48h após a emissão</li>
            <li>✨ Sem compromisso — você decide se quer negociar</li>
          </ul>
        </div>

        {/* Lado direito: formulário + resultado */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          {!resultadoVisivel ? (
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Nome (opcional) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Nome (opcional)
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
                />
              </div>

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
                  onChange={(e) => setPontos(onlyDigits(e.target.value))}
                  placeholder="Ex.: 100000"
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Mínimo recomendado: 1.000 pontos.
                </p>
              </div>

              {/* E-mail (opcional) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
                />
              </div>

              {/* Botão */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#004c56] text-white font-semibold py-3 hover:bg-[#00636f] transition"
              >
                Ver minha cotação
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="font-semibold text-green-800 mb-1">
                  Cotação estimada
                </div>
                <div className="text-sm text-green-900 space-y-1">
                  <div>Companhia: <strong>{cia}</strong></div>
                  <div>Pontos: <strong>{pontosNum.toLocaleString("pt-BR")}</strong></div>
                  <div>CPM: <strong>R$ {cpm}</strong></div>
                  <div>Valor estimado: <strong>{brl(valor)}</strong></div>
                </div>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center rounded-xl bg-[#25D366] text-white font-semibold py-3 hover:brightness-95 transition ${
                  WA_SELLER ? "" : "pointer-events-none opacity-60"
                }`}
                title={WA_SELLER ? "Abrir WhatsApp" : "Configure NEXT_PUBLIC_WA_SELLER"}
              >
                Continuar no WhatsApp
              </a>

              <button
                onClick={() => setResultadoVisivel(false)}
                className="w-full rounded-xl border border-neutral-300 py-3 font-semibold hover:bg-neutral-50 transition"
              >
                Refazer cotação
              </button>

              {/* Preview do texto enviado para o seu Whats */}
              <details className="text-xs text-neutral-500">
                <summary className="cursor-pointer select-none">
                  Ver mensagem que será enviada no WhatsApp
                </summary>
                <pre className="mt-2 whitespace-pre-wrap bg-neutral-50 p-3 rounded-xl border text-neutral-700">
{mensagemWhats}
                </pre>
              </details>
            </div>
          )}
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Aba Milhas. Todos os direitos reservados.
      </footer>
    </main>
  );
}

