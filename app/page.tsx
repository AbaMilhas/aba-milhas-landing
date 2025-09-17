"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form) as any);
    setLoading(true);
    try {
      const r = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) {
        alert(j.error || "Erro ao enviar");
      } else {
        alert(`Cotação enviada no seu WhatsApp: R$ ${j.valor}`);
        form.reset();
      }
    } catch (err: any) {
      alert("Falha de rede ou servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl p-6 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Venda suas milhas com segurança</h1>
          <p className="text-gray-600">Preencha os dados e receba a cotação automática no WhatsApp.</p>
        </header>

        <form className="space-y-4" onSubmit={onSubmit}>
          <input name="milhas" type="number" min={1000} required placeholder="Quantidade de milhas"
                 className="w-full rounded-xl border p-3" />
          <select name="cia" required className="w-full rounded-xl border p-3">
            <option value="">Companhia</option>
            <option value="LATAM">LATAM</option>
            <option value="Smiles">Smiles (GOL)</option>
            <option value="Azul">Azul</option>
            <option value="TAP">TAP</option>
          </select>
          <input name="email" type="email" required placeholder="E-mail"
                 className="w-full rounded-xl border p-3" />
          <input name="whatsapp" required placeholder="WhatsApp (55DDDNUMERO)"
                 className="w-full rounded-xl border p-3" />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="consent" required className="mt-1" />
            Aceito contato via WhatsApp e e-mail (LGPD).
          </label>
          <button
            className="w-full rounded-xl border p-3 font-semibold hover:bg-gray-50 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Enviando..." : "Calcular e enviar no WhatsApp"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Ao enviar, você concorda com nossa Política de Privacidade.
        </p>
      </section>
    </main>
  );
}
