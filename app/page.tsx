"use client";

import React, { useEffect, useMemo, useState } from "react";

type CiaMap = Record<string, number>;

function onlyDigits(s: string) {
  return s.replace(/[^\d]/g, "");
}
function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Page() {
  const [vendedorWhats, setVendedorWhats] = useState<string>("");
  const [cias, setCias] = useState<CiaMap>({});
  const [cia, setCia] = useState("");
  const [pontos, setPontos] = useState("");
  const [whatsLocal, setWhatsLocal] = useState(""); // DDD+Número do cliente (sem 55)
  const [email, setEmail] = useState("");
  const [erroVendedor, setErroVendedor] = useState<string | null>(null);
  const [mostrouCotacao, setMostrouCotacao] = useState(false);

  // Busca config pública do servidor (número do vendedor)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/public-config", { cache: "no-store" });
        const data = await r.json().catch(() => ({}));
        const raw = (data?.vendorWhats ?? "") as string;
        setVendedorWhats(raw || "");
      } catch {
        setVendedorWhats("");
      }
    })();
  }, []);

  // Carrega as cias
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

  // valida vendedor
  useEffect(() => {
    if (!vendedorWhats || !/^\d{12,15}$/.test(vendedorWhats)) {
      setErroVendedor(
        "Número do vendedor ausente/ inválido. Configure VENDOR_WHATS (ou NEXT_PUBLIC_VENDEDOR_WHATS) na Vercel."
      );
    } else {
      setErroVendedor(null);
    }
  }, [vendedorWhats]);

  const cpm = useMemo(() => (cia ? cias[cia] ?? 0 : 0), [cia, cias]);
  const pontosNum = useMemo(() => Number(onlyDigits(pontos) || 0), [pontos]);
  const valor = useMemo(() => (pontosNum / 1000) * (cpm || 0), [pontosNum, cpm]);

  const cotacaoTexto = useMemo(() => {
    if (!cia || !pontosNum) return "";
    return [
      "✈️ *Aba Milhas* — cotação instantânea",
      `• Companhia: ${cia}`,
      `• Pontos: ${pontosNum.toLocaleString("pt-BR")}`,
      `• Valor estimado: ${brl(valor)} (CPM R$ ${cpm})`,
      "",
      "Se desejar continuar a negociação, responda esta mensagem. 😉",
    ].join("\n");
  }, [cia, pontosNum, valor, cpm]);

  function handleVerCotacao(e: React.FormEvent) {
    e.preventDefault();

    const whatsDigits = onlyDigits(whatsLocal);

    if (!cia) return alert("Selecione a companhia aérea.");
    if (!pontosNum || pontosNum < 1000)
      return alert("Informe a quantidade de pontos (mínimo 1.000).");
    if (!/^\d{10,11}$/.test(whatsDigits))
      return alert("WhatsApp do cliente deve ser DDD+Número (10 ou 11 dígitos).");
    if (!email.includes("@")) return alert("Informe um e-mail válido.");

    setMostrouCotacao(true);
  }

  const linkWhatsVendedor = useMemo(() => {
    if (!cotacaoTexto || !vendedorWhats) return "#";
    const msg = encodeURIComponent(
      cotacaoTexto +
        `\n\nContato do cliente:\n• WhatsApp: +55${onlyDigits(whatsLocal)}\n• E-mail: ${email}`
    );
    return `https://wa.me/${vendedorWhats}?text=${msg}`;
  }, [cotacaoTexto, vendedorWhats, whatsLocal, email]);

  return (
    <main className="min-h-dvh bg-neutral-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center gap-3">
          <img src="/logo.png" alt="Aba Milhas" className="h-10 w-auto" />
          <div className="text-neutral-700 leading-tight">
            <div className="font-semibold">Aba Milhas</div>
            <div className="text-sm">Compra e venda de milhas com segurança</div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8 grid lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0a3d44]">
            Receba sua cotação em segundos
          </h1>
          <p className="mt-4 text-neutral-700 leading-relaxed">
            Preencha os dados, veja o valor estimado agora mesmo e, se quiser,
            continue a negociação pelo WhatsApp. Atendimento <strong>humanizado</strong> e
            pagamento <strong>rápido e seguro</strong> entre <strong>25h</strong> e até <strong>48h</strong> após a emissão.
          </p>

          <form onSubmit={handleVerCotacao} className="mt-8 bg-white rounded-2xl shadow p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Companhia aérea</label>
              <select
                value={cia}
                onChange={(e) => setCia(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a6a74]"
                required
              >
                {!Object.keys(cias).length && <option value="">Carregando...</option>}
                {Object.keys(cias).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Quantidade de pontos</label>
              <input
                inputMode="numeric"
                value={pontos}
                onChange={(e) => setPontos(onlyDigits(e.target.value))}
                placeholder="Ex.: 100000"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a6a74]"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">Mínimo recomendado: 1.000 pontos.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">WhatsApp do cliente (Brasil)</label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-xl border border-neutral-300 bg-neutral-50 px-3 text-neutral-700">
                  +55
                </span>
                <input
                  inputMode="numeric"
                  value={whatsLocal}
                  onChange={(e) => setWhatsLocal(onlyDigits(e.target.value))}
                  placeholder="DDD+Número (ex.: 11999999999)"
                  className="w-full rounded-r-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a6a74]"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Digite apenas DDD+Número (10 ou 11 dígitos). O +55 já está fixo.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">E-mail do cliente</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a6a74]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#0a6a74] text-white font-semibold py-3 hover:bg-[#0b7c88] transition"
            >
              Ver minha cotação
            </button>

            {erroVendedor && (
              <div className="rounded-xl bg-rose-50 text-rose-700 text-sm px-3 py-2">{erroVendedor}</div>
            )}
          </form>
        </div>

        <aside>
          <div className="sticky top-6">
            <div className="bg-white rounded-2xl shadow p-6 border border-teal-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0a3d44]">Sua cotação</h2>
                <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">estimativa</span>
              </div>

              {!mostrouCotacao ? (
                <p className="mt-4 text-neutral-600">
                  Preencha o formulário e clique em <strong>“Ver minha cotação”</strong>. A estimativa aparece aqui.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl bg-neutral-50 px-4 py-3">
                    <div className="text-sm text-neutral-500">Companhia</div>
                    <div className="text-lg font-semibold text-neutral-800">{cia}</div>
                  </div>

                  <div className="rounded-xl bg-neutral-50 px-4 py-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-neutral-500">Pontos</div>
                      <div className="text-lg font-semibold text-neutral-800">{pontosNum.toLocaleString("pt-BR")}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500">CPM</div>
                      <div className="text-lg font-semibold text-neutral-800">R$ {cpm}</div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-emerald-50 px-4 py-3 border border-emerald-200">
                    <div className="text-sm text-emerald-700">Valor estimado</div>
                    <div className="text-2xl font-bold text-emerald-800">{brl(valor)}</div>
                  </div>

                  <div className="text-xs text-neutral-500">
                    Valores podem variar conforme regras da companhia e janela de emissão.
                  </div>

                  <a
                    href={linkWhatsVendedor}
                    target="_blank"
                    rel="noreferrer"
                    className={`block text-center rounded-xl py-3 font-semibold transition ${
                      erroVendedor || !cotacaoTexto
                        ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                        : "bg-[#0a6a74] text-white hover:bg-[#0b7c88]"
                    }`}
                    aria-disabled={!!(erroVendedor || !cotacaoTexto)}
                  >
                    Continuar pelo WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>

      <footer className="py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Aba Milhas. Todos os direitos reservados.
      </footer>
    </main>
  );
}

