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

    const to = `55${whatsDigits}`;

    const texto =
`✈️ *Aba Milhas* — sua cotação chegou!
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
          <img src="/logo-aba.png" alt="Aba Milhas" className="h-12 w-auto" />
          <div className="text-neutral-700">
            <div className="font-semibold">Aba Milhas</

