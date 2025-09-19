"use client";

import React, { useEffect, useState } from "react";

type CiaMap = Record<string, number>;

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Page() {
  const [cias, setCias] = useState<CiaMap | null>(null);
  const [cia, setCia] = useState<string>("");
  const [milhas, setMilhas] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // carrega as cias do seu endpoint /api/cias
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/cias", { cache: "no-store" });
        if (r.ok) {
          const data = (await r.json()) as CiaMap;
          setCias(data);
          // define uma cia padrão
          const first = Object.keys(data)[0];
          if (first) setCia(first);
        } else {
          setCias(null);
        }
      } catch {
        setCias(null);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    // validações simples
    const milhasNum = Number(milhas.replace(/\D/g, ""));
    if (!milhasNum || milhasNum <= 0) {
      setFeedback("Informe a quantidade de milhas.");
      return;
    }
    if (!cia) {
      setFeedback("Selecione a companhia.");
      return;
    }
    if (!whatsapp.match(/^\d{11,13}$/)) {
      setFeedback("Informe o WhatsApp no formato DDI+DDD+Número (ex.: 55DDDNÚMERO).");
      return;
    }

    // cálculo do valor estimado com base no CPM da cia (R$ por 1.000 milhas)
    const cpm = cias?.[cia] ?? 25; // fallback
    const valor = (milhasNum / 1000) * cpm;

    // mensagem que será enviada no WhatsApp
    const mensagem =
`✈️ *Aba Milhas* — sua simulação chegou!

• Companhia: ${cia}
• Milhas: ${milhasNum.toLocaleString("pt-BR")}
• Valor estimado: ${brl(valor)}

👉 Para continuar a negociação, responda esta mensagem.`;

    try {
      setEnviando(true);

      // chama sua API /api/send (já configurada com WA_TOKEN/WA_PHONE_ID/WA_TO)
      // se quiser mandar para o número digitado no formulário em vez de WA_TO,
      // você pode (opcionalmente) criar outra rota que aceite "to" no corpo.
      const r = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: mensagem }),
      });

      const data = await r.json();

      if (r.ok && data?.ok !== false) {
        setFeedback("✅ Enviado no WhatsApp! Verifique sua conversa.");
        // limpa só os campos do lead
        setEmail("");
        // mantém milhas/cia para facilitar novo cálculo
      } else {
        setFeedback("❌ Não foi possível enviar no WhatsApp. Verifique o token (WA_TOKEN) e tente novamente.");
      }
    } catch (err) {
      setFeedback("❌ Erro ao enviar. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      {/* Header com logo (assume /public/logo-aba.png transparente) */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          <img
            src="/logo-aba.png"
            alt="Aba Milhas"
            className="h-12 w-auto"
          />
          <div className="text-neutral-700">
            <div className="font-semibold">Aba Milhas</div>
            <div className="text-sm">Compra e venda de milhas com segurança</div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-brand-600">Receba a cotação das suas milhas por WhatsApp</h1>
          <p className="text-neutral-700">
            Preencha os dados abaixo e enviaremos automaticamente o valor estimado das suas milhas no seu WhatsApp.
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
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {cias
                ? Object.keys(cias).map((k) => (
                    <option key={k} value={k}>
                      {k} {typeof cias[k] === "number" ? `— R$ ${cias[k]}/1.000` : ""}
                    </option>
                  ))
                : ["LATAM", "Smiles", "TAP", "Azul"].map((k) => (
                    <option key={k} value={k}>
                      {k}
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
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">WhatsApp (DDI+DDD+Número)</label>
            <input
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Ex.: 5599999999999"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Ex.: Brasil → 55 + DDD + número. Exemplo: <span className="font-mono">5591999999999</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3 hover:bg-brand-700 transition disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Receber cotação no WhatsApp"}
          </button>

          {feedback && (
            <div
              className={`text-sm rounded-xl px-3 py-2 ${
                feedback.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {feedback}
            </div>
          )}

          <p className="text-xs text-neutral-500">
            Ao enviar, você concorda em receber a cotação no seu WhatsApp. Sem spam.
          </p>
        </form>
      </section>

      <footer className="py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Aba Milhas. Todos os direitos reservados.
      </footer>
    </main>
  );
}
