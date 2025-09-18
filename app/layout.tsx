import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-surface text-ink antialiased">
        {/* HEADER */}
        <header className="border-b border-brand-100 bg-brand-50">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Logo maior e visível */}
              <img
                src="/logo.png"
                alt="Aba Milhas"
                className="h-16 w-auto drop-shadow-sm"
              />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xl font-bold text-brand-600">Aba Milhas</span>
                <span className="text-xs text-muted-ink">Compra e venda de milhas com segurança</span>
              </div>
            </div>

            {/* CTA de topo opcional (rolagem p/ formulário) */}
            <a
              href="#cotacao"
              className="hidden sm:inline-block rounded-xl2 bg-brand-600 text-white px-4 py-2 font-semibold hover:bg-brand-700 transition"
            >
              Fazer cotação
            </a>
          </div>
        </header>

        {children}

        {/* FOOTER */}
        <footer className="mt-16 border-t border-brand-100 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-ink flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} Aba Milhas. Todos os direitos reservados.</span>
            <div className="flex items-center gap-4">
              <a className="hover:text-brand-600" href="#como-funciona">Como funciona</a>
              <a className="hover:text-brand-600" href="#beneficios">Benefícios</a>
              <a className="hover:text-brand-600" href="#cotacao">Cotação</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
