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
  const [cpf, setCpf] = useState("");
  const [whats, setWhats] = useState("");
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

    const cpfDigits = onlyDigits(cpf);
    const whatsDigits = onlyDigits(whats);

    if (!cia) return setMsg("Selecione a companhia aérea.");
    if (!pontosNum || pontosNum < 1000) return setMsg("Informe a quantidade de pontos (mínimo 1.000).");
    if (cpfDigits.length !== 11) return setMsg("CPF deve ter 11 dígitos.");
    if (!/^\d{11,13}$/.test(whatsDigits)) return setMsg("WhatsApp deve ser DDI+DDD+Número (ex.: 5591999999999).");
    if (!email.includes("@")) return setMsg("Informe um e-mail válido.");

    const texto =
`✈️ *Aba Milhas* — sua cotação chegou!
• Companhia: ${cia}
• Pontos: ${pontosNum.toLocaleString("pt-BR")}
• CPF: ${cpfDigits}
• E-mail: ${email}
• Valor estimado: ${brl(valor)} (CPM R$ ${cpm})

👉 Para continuar a negociação, acesse: ${CONTINUE_URL}`;

    try {
      setEnviando(true);
      const r = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: whatsDigits, body: texto })
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data?.ok !== false) {
        setMsg("✅ Cotação enviada no seu WhatsApp!");
        // limpa dados sensíveis
        setCpf("");
        setEmail("");
        // mantém cia/pontos para facilitar novo envio
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
            Preencha os dados abaixo. Calculamos o valor e enviamos no seu WhatsApp com um link para continuar.
          </p>
          <ul className="text-neutral-700 list-disc pl-5 space-y-1">
            <li>Principais cias aéreas</li>
            <li>Pagamento rápido e seguro</li>
            <li>Sem compromisso</li>
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
              {!Object.keys(cias).length && <option value="">Carregando...</option>}
              {Object.keys(cias).map((k) => (
                <option key={k} value={k}>{k}</option>
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
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">Mínimo recomendado: 1.000 pontos.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">CPF</label>
            <input
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(onlyDigits(e.target.value))}
              placeholder="Somente números"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004c56]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">WhatsApp (DDI+DDD+Número)</label>
            <input
              inputMode="numeric"
              value={whats}
              onChange={(e) => setWhats(onlyDigits(e.target.value))}
              placeholder="Ex.: 5591999999999"
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

          <div className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
            <div>CPM da {cia || "cia"}: <b>{cpm ? brl(cpm) : "—"}</b> por 1.000 pts</div>
            <div>Valor estimado: <b>{pontosNum && cpm ? brl(valor) : "—"}</b></div>
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

