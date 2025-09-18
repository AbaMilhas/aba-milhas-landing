"use client";

import { useEffect, useState } from "react";

type QuoteSuccess = { ok: true; valor: string };
type QuoteError = { error: string; detail?: string };
type QuoteResponse = QuoteSuccess | QuoteError;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [cias, setCias] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/cias");
        const j = (await r.json()) as { cias: string[] };
        setCias(j.cias || []);
      } catch {
        setCias([]);
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const fd = new FormData(form);
    const payload = {
      milhas: Number(fd.get("milhas") ?? 0),
      cia: String(fd.get("cia") ?? ""),
      email: String(fd.get("email") ?? ""),
      whatsapp: String(fd.get("whatsapp") ?? ""),
      consent: (form.elements.namedItem("consent") as HTMLInputElement | null)?.checked ?? false,
    };

    setLoading(true);
    try {
      const r = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j: QuoteResponse = await r.json();

      if (!r.ok || "error" in j) {
        alert(("error" in j && j.error) ? j.error : "Erro ao enviar");
      } else {
        alert(`Cotação enviada no seu WhatsApp: R$ ${j.valor}`);
        form.reset();
      }
    } catch {
      alert("Falha de rede ou servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* HERO */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Venda suas <span className="text-brand-600">milhas</span> com segurança e rapidez
            </h1>
            <p className="mt-4 text-lg text-muted-ink">
              Receba uma cotação automática no seu WhatsApp em segundos. Sem burocracia.
            </p>

            <ul className="mt-6 space-y-2 text-ink">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" />
                Pagamento rápido e transparente
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" />
                Oferta justa com base no mercado
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" />
                Suporte humano durante a negociação
              </li>
            </ul>

            <a
              href="#cotacao"
              className="mt-8 inline-block rounded-xl2 bg-brand-600 text-white px-6 py-3 font-semibold hover:bg-brand-700 transition"
            >
              Fazer cotação agora
            </a>
          </div>

          {/* Card destacado: Prova social curta */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6 shadow-soft">
            <p className="text-base text-ink">
              “Processo muito rápido! Enviei minhas milhas e recebi a cotação no WhatsApp na hora.
              Negociação justa e atendimento excelente.”
            </p>
            <div className="mt-4 text-sm text-muted-ink">— Cliente Aba Milhas</div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-bold">Como funciona</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-brand-100 p-5 bg-white">
              <div className="text-brand-600 font-bold">1. Informe seus dados</div>
              <p className="mt-2 text-muted-ink">Quantidade de milhas, companhia, e seus contatos.</p>
            </div>
            <div className="rounded-2xl border border-brand-100 p-5 bg-white">
              <div className="text-brand-600 font-bold">2. Receba a cotação</div>
              <p className="mt-2 text-muted-ink">Nós calculamos e enviamos o valor por WhatsApp.</p>
            </div>
            <div className="rounded-2xl border border-brand-100 p-5 bg-white">
              <div className="text-brand-600 font-bold">3. Negocie e conclua</div>
              <p className="mt-2 text-muted-ink">Se gostar, seguimos com a venda de forma segura.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section id="cotacao" className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-2xl shadow-soft border border-brand-100 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-bold">Calcular e enviar no WhatsApp</h2>
            <p className="mt-1 text-sm text-muted-ink">Preencha os dados abaixo:</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-ink">Quantidade de milhas</label>
                  <input
                    name="milhas"
                    type="number"
                    min={1000}
                    required
                    placeholder="Ex.: 120000"
                    className="mt-1 w-full rounded-xl2 border border-brand-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-ink">Companhia</label>
                  <select
                    name="cia"
                    required
                    className="mt-1 w-full rounded-xl2 border border-brand-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <option value="">Selecione</option>
                    {cias.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-ink">E-mail</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    className="mt-1 w-full rounded-xl2 border border-brand-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-ink">WhatsApp</label>
                  <input
                    name="whatsapp"
                    required
                    placeholder="55DDDNUMERO"
                    className="mt-1 w-full rounded-xl2 border border-brand-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="consent" required className="mt-1 accent-brand-600" />
                Aceito contato via WhatsApp e e-mail (LGPD).
              </label>

              <button
                className="w-full rounded-xl2 bg-brand-600 text-white p-3 font-semibold hover:bg-brand-700 transition disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Enviando..." : "Calcular e enviar no WhatsApp"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS / PROVAS SOCIAIS */}
      <section id="beneficios" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="text-2xl font-bold">Por que a Aba Milhas?</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-brand-100 p-5">
              <div className="text-brand-600 font-bold">Transparência</div>
              <p className="mt-2 text-muted-ink">Processo claro, valores justos e sem pegadinhas.</p>
            </div>
            <div className="rounded-2xl border border-brand-100 p-5">
              <div className="text-brand-600 font-bold">Rapidez</div>
              <p className="mt-2 text-muted-ink">Cotação instantânea e pagamento ágil.</p>
            </div>
            <div className="rounded-2xl border border-brand-100 p-5">
              <div className="text-brand-600 font-bold">Segurança</div>
              <p className="mt-2 text-muted-ink">Equipe especializada e atendimento humano.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

