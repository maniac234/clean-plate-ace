import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  Store,
  Users,
  Smartphone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import logo from "@/assets/logo.png";

const features = [
  {
    icon: ClipboardCheck,
    title: "Check-list Inteligente",
    desc: "30 itens de inspeção com pontuação automática. Marque conformidades e não conformidades com poucos toques.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e Gráficos",
    desc: "Acompanhe a evolução das filiais com gráficos comparativos e histórico completo de inspeções.",
  },
  {
    icon: ShieldCheck,
    title: "Controle de Qualidade",
    desc: "Padrão de avaliação profissional: Excelente, Ótimo, Satisfatório, Regular e Insatisfatório.",
  },
  {
    icon: Store,
    title: "Múltiplas Filiais",
    desc: "Gerencie todas as suas unidades em um só lugar com dashboards independentes e visão consolidada.",
  },
  {
    icon: Users,
    title: "Gestão de Equipe",
    desc: "Controle de acesso para administradores e funcionários com logs de atividade completos.",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    desc: "Realize inspeções pelo celular, tablet ou computador. Seu controle na palma da mão.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Cadastre suas Filiais",
    desc: "Adicione as unidades que deseja inspecionar e defina os responsáveis.",
  },
  {
    step: "02",
    title: "Realize Inspeções",
    desc: "Use o check-list completo para avaliar cada item de higiene e segurança alimentar.",
  },
  {
    step: "03",
    title: "Acompanhe Resultados",
    desc: "Visualize a evolução com gráficos, logs detalhados e relatórios por período.",
  },
];

const categories = [
  "Higiene Pessoal e Conduta",
  "Higiene de Instalações, Equipamentos e Utensílios",
  "Controles Operacionais",
  "Preenchimento de Planilhas de Controle",
  "Controle Integrado de Pragas",
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Ticker bar */}
      <div className="overflow-hidden bg-background border-b text-foreground py-1.5">
        <div className="animate-marquee whitespace-nowrap text-xs font-medium tracking-wide">
          {"🍽️ CONTROLE DE QUALIDADE ALIMENTAR    ⚡ INSPEÇÕES PROFISSIONAIS    "
            .repeat(8)}
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Troppo Buono" className="h-8 object-contain" />
            <span className="text-lg font-bold tracking-tight">Troppo Buono</span>
          </div>
          <div className="hidden items-center gap-6 text-sm md:flex">
            <a href="#funcionalidades" className="text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#categorias" className="text-muted-foreground hover:text-foreground transition-colors">Categorias</a>
          </div>
          <Button onClick={() => navigate("/login")} size="sm" className="rounded-full px-5">
            Entrar
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-background text-foreground border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--success)/0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center md:py-32">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Controle de qualidade com{" "}
            <span className="text-[hsl(var(--success))]">precisão total</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-lg">
            O sistema completo para inspeção de higiene e segurança alimentar.
            Check-list, relatórios, gráficos e gestão de múltiplas filiais — tudo em um só lugar, 100% online.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="rounded-full bg-[hsl(var(--success))] px-8 text-white hover:bg-[hsl(var(--success)/0.9)]"
              onClick={() => navigate("/login")}
            >
              Acessar Sistema <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Como Funciona</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
            Chega de planilhas e controles manuais. Digitalize suas inspeções em 3 passos simples.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {howItWorks.map((item) => (
            <Card key={item.step} className="border-2 hover:border-[hsl(var(--success)/0.5)] transition-colors">
              <CardContent className="p-6">
                <span className="text-3xl font-black text-[hsl(var(--success))]">{item.step}</span>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="bg-muted/50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Funcionalidades</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
              Tudo que você precisa para manter o padrão de qualidade das suas unidades.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="bg-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--success)/0.1)]">
                    <f.icon className="h-5 w-5 text-[hsl(var(--success))]" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Categorias de Inspeção</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
            Check-list completo cobrindo todas as áreas críticas de segurança alimentar.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-3 rounded-lg border p-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
              <span className="font-medium text-sm">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background text-foreground py-16 md:py-24 border-t">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Pronto para elevar o padrão de qualidade?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Comece agora a digitalizar suas inspeções e tenha controle total sobre a higiene e segurança das suas unidades.
          </p>
          <Button
            size="lg"
            className="mt-8 rounded-full bg-[hsl(var(--success))] px-8 text-white hover:bg-[hsl(var(--success)/0.9)]"
            onClick={() => navigate("/login")}
          >
            Acessar o Sistema <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <img src={logo} alt="Troppo Buono" className="h-6 object-contain" />
            <span className="text-sm font-semibold">Troppo Buono</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Troppo Buono. Sistema de Controle de Qualidade Alimentar.
          </p>
        </div>
      </footer>
    </div>
  );
}
