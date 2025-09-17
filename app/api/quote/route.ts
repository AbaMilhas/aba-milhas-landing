export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      milhas: number | string;
      cia: "LATAM" | "Smiles" | "Azul" | "TAP" | (string & {});
      email: string;
      whatsapp: string;
      consent: boolean;
    };

    const { milhas, cia, email, whatsapp, consent } = body;

    if (!consent) return Response.json({ error: "Consentimento LGPD obrigatório" }, { status: 400 });
    if (!milhas || !cia || !email || !whatsapp) {
      return Response.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const CPM = { LATAM: 25, Smiles: 21, Azul: 20, TAP: 18 } as const;
    if (!(cia in CPM)) return Response.json({ error: "Companhia inválida" }, { status: 400 });

    const valor = ((Number(milhas) / 1000) * CPM[cia as keyof typeof CPM]).toFixed(2);
    const to = String(whatsapp).replace(/\D/g, "");

    // ----- WhatsApp Cloud API (opcional) -----
    const token = process.env.WA_TOKEN;
    const phoneId = process.env.WA_PHONE_ID;
    if (token && phoneId) {
      const templateName = "cotacao_milhas_aba";
      const resp = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: "pt_BR" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: email.split("@")[0] || "Cliente" },
                  { type: "text", text: String(milhas) },
                  { type: "text", text: cia },
                  { type: "text", text: valor },
                ],
              },
            ],
          },
        }),
      });

      if (!resp.ok) {
        const detail = await resp.text();
        return Response.json({ error: "Falha no envio WhatsApp", detail }, { status: 500 });
      }
    } else {
      console.log(`[DEV] Enviaria WhatsApp para ${to} com valor R$ ${valor}`);
    }

    return Response.json({ ok: true, valor });
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: "Erro inesperado", detail }, { status: 500 });
  }
}
