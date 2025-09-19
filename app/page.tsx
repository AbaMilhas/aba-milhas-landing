"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [cias, setCias] = useState<string[]>([]);
  const [form, setForm] = useState({
    cia: "",
    milhas: "",
    email: "",
    whatsapp: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Buscar as cias da API
  useEffect(() => {
    fetch("/api/cias")
      .then((res) => res.json())
      .then((data) => setCias(data.cias || []))
      .catch(() => setCias([]));
  }, []);

  // Enviar formulário -> WhatsApp Cloud API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const resp = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: `📩 Nova cotação:
✈ Companhia: ${form.cia}
💳 Milhas: ${form.milhas}
📧 E-mail: ${form.email}
📱 WhatsApp: ${form.whatsapp}`,
        }),
      });

      const data = await resp.json();
      if (resp.ok) {
        setSuccess(true);
        setForm({ cia: "", milhas: "", email: "", whatsapp: "" });
      } else {
        alert("Erro ao enviar mensagem: " + JSON.stringify(data));
      }
    } catch (err) {
      alert("Erro inesperado: " + (err as Error).message);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between bg-[#eaf4f6] px-8 py-4 shadow">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Aba Milhas" className="h-10" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Aba Milhas</h1>
            <p className="text-sm text-gray-600">
              Compra e venda de milhas com segurança
            </p>
          </div>
        </div>
        <a
          href="#form"
          className="rounded-full bg-[#004c56] px-6 py-2 text-white shadow hover:bg-[#00636f]"
        >
          Fazer cotação
        </a>
      </header>

      {/* Conteúdo principal */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-3xl font-bold text-[#004c56]">
            Receba a cotação das suas milhas por WhatsApp
          </h2>
          <p className="mb-6 text-gray-700">
            Preencha os dados abaixo e enviaremos automaticamente o valor
            estimado das suas milhas no seu WhatsApp.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-gray-700">
            <li>Atendemos principais cias aéreas</li>
            <li>Pagamento rápido e seguro</li>
            <li>Sem compromisso — você decide se quer negociar</li>
          </ul>
        </div>

        {/* Formulário */}
        <form
          id="form"
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border p-6 shadow"
        >
          {/* Companhia */}
          <div>
            <label
              htmlFor="cia"
              className="block text-sm font-medium text-gray-700"
            >
              Companhia aérea
            </label>
            <select
              id="cia"
              name="cia"
              value={form.cia}
              onChange={(e) => setForm({ ...form, cia: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            >
              <option value="">Selecione a companhia</option>
              {cias.map((cia) => (
                <option key={cia} value={cia}>
                  {cia}
                </option>
              ))}
            </select>
          </div>

          {/* Milhas */}
          <div>
            <label
              htmlFor="milhas"
              className="block text-sm font-medium text-gray-700"
            >
              Quantidade de milhas
            </label>
            <input
              id="milhas"
              type="number"
              placeholder="Ex.: 100000"
              value={form.milhas}
              onChange={(e) => setForm({ ...form, milhas: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label
              htmlFor="whatsapp"
              className="block text-sm font-medium text-gray-700"
            >
              WhatsApp (DDI+DDD+Número)
            </label>
            <input
              id="whatsapp"
              type="tel"
              placeholder="Ex.: 5591999999999"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Ex.: Brasil → 55 + DDD + número. Exemplo: 5591999999999
            </p>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#004c56] py-2 text-white hover:bg-[#00636f] disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Receber cotação no WhatsApp"}
          </button>

          {success && (
            <p className="text-green-600">Mensagem enviada com sucesso ✅</p>
          )}
        </form>
      </section>
    </main>
  );
}

