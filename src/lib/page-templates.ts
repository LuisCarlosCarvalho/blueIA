import type { BlockConfig } from '@/blocks/types'

export interface PageTemplate {
  id: string
  name: string
  description: string
  category: string
  badge?: string
  generateBlocks: (params: {
    projectName: string
    clientName: string
    segment: string
    niche: string
  }) => BlockConfig[]
}

export const pageTemplates: PageTemplate[] = [
  {
    id: 'institucional',
    name: 'Landing Page Institucional',
    description: 'Estrutura completa e elegante para apresentar a empresa, diferenciais, equipa e serviços com autoridade.',
    category: 'Corporativo',
    badge: 'Mais Popular',
    generateBlocks: ({ projectName, clientName, segment, niche }) => [
      {
        id: `block-${Date.now()}-nav`,
        type: 'navbar',
        variant: 'default',
        props: {
          logo: clientName || projectName || 'Blue IA Studio',
          links: ['Sobre Nós', 'Soluções', 'Diferenciais', 'Contacto'],
          ctaText: 'Falar com Consultor',
        },
      },
      {
        id: `block-${Date.now()}-hero`,
        type: 'hero',
        variant: 'centered',
        props: {
          badge: segment || 'Inovação e Excelência',
          headline: `Soluções líderes em ${niche || segment || 'tecnologia e serviços'}`,
          subheadline: `A ${clientName || projectName || 'Nossa Empresa'} entrega excelência, precisão e resultados comprovados para o mercado de ${segment || 'alta performance'}.`,
          primaryCta: 'Descobrir Soluções',
          secondaryCta: 'Conhecer a Equipa',
        },
      },
      {
        id: `block-${Date.now()}-features`,
        type: 'features',
        variant: 'grid',
        props: {
          label: 'Diferenciais',
          title: 'Porquê escolher o nosso trabalho',
          subtitle: `Padrões de excelência e metodologia comprovada para o segmento de ${niche || segment}.`,
          items: [
            { icon: 'ShieldCheck', title: 'Segurança & Confiança', description: 'Processos auditados e conformidade rigorosa em todas as etapas.' },
            { icon: 'Zap', title: 'Agilidade & Eficiência', description: 'Execução rápida e focada em resultados mensuráveis para o seu negócio.' },
            { icon: 'Sparkles', title: 'Inovação Contínua', description: 'Tecnologias de ponta desenhadas especificamente para as suas necessidades.' },
          ],
        },
      },
      {
        id: `block-${Date.now()}-stats`,
        type: 'stats',
        variant: 'grid',
        props: {
          stats: [
            { value: '+98%', label: 'Satisfação de Clientes' },
            { value: '+500', label: 'Projetos Entregues' },
            { value: '24/7', label: 'Suporte Dedicado' },
            { value: '10x', label: 'Eficiência Operacional' },
          ],
        },
      },
      {
        id: `block-${Date.now()}-testimonials`,
        type: 'testimonials',
        variant: 'cards',
        props: {
          label: 'Testemunhos',
          title: 'O que dizem os nossos parceiros',
          subtitle: 'Feedback autêntico de quem confia na nossa entrega.',
          testimonials: [
            {
              quote: 'A experiência e dedicação da equipa transformaram a nossa presença digital e a geração de novas oportunidades.',
              author: 'Dr. Miguel Santos',
              role: `Diretor Executivo — ${segment || 'Empresas'}`,
            },
            {
              quote: 'Profissionalismo impecável, entrega no prazo e suporte acima da média. Altamente recomendado.',
              author: 'Eng.ª Teresa Martins',
              role: `Gestora de Operações — ${niche || 'Inovação'}`,
            },
          ],
        },
      },
      {
        id: `block-${Date.now()}-cta`,
        type: 'cta',
        variant: 'simple',
        props: {
          headline: `Pronto para elevar o seu negócio em ${niche || segment}?`,
          subheadline: 'Agende uma conversa estratégica sem compromisso com os nossos especialistas.',
          buttonText: 'Solicitar Demonstração',
        },
      },
      {
        id: `block-${Date.now()}-footer`,
        type: 'footer',
        variant: 'simple',
        props: {
          logo: clientName || projectName || 'Blue IA',
          copyright: `© ${new Date().getFullYear()} ${clientName || projectName}. Todos os direitos reservados.`,
          links: ['Termos de Serviço', 'Privacidade', 'Contacto', 'Segurança'],
        },
      },
    ],
  },
  {
    id: 'vendas-direta',
    name: 'Página de Vendas Direta',
    description: 'Foco total em conversão com proposta de valor clara, tabela de planos/preços, garantias e FAQ.',
    category: 'Vendas',
    badge: 'Alta Conversão',
    generateBlocks: ({ projectName, clientName, segment, niche }) => [
      {
        id: `block-${Date.now()}-nav`,
        type: 'navbar',
        variant: 'default',
        props: {
          logo: clientName || projectName || 'Blue IA',
          links: ['Benefícios', 'Preços', 'Garantia', 'Dúvidas'],
          ctaText: 'Comprar Agora',
        },
      },
      {
        id: `block-${Date.now()}-hero`,
        type: 'hero',
        variant: 'split',
        props: {
          badge: 'Oferta Exclusiva',
          headline: `Acelere o seu crescimento em ${niche || segment}`,
          subheadline: `A solução definitiva desenvolvida para multiplicar os seus resultados sem complicações. Comece hoje mesmo.`,
          primaryCta: 'Garantir Acesso Agora',
          secondaryCta: 'Ver Como Funciona',
        },
      },
      {
        id: `block-${Date.now()}-features`,
        type: 'features',
        variant: 'list',
        props: {
          label: 'Tudo Incluído',
          title: 'O que vai receber ao aderir',
          subtitle: 'Acesso completo a todas as ferramentas e recursos essenciais.',
          items: [
            { icon: 'CheckCircle', title: 'Implementação Imediata', description: 'Acesso instantâneo com onboarding guiado passo a passo.' },
            { icon: 'Zap', title: 'Máxima Produtividade', description: 'Automação de processos que poupa até 15 horas semanais.' },
            { icon: 'Headphones', title: 'Acompanhamento Prioritário', description: 'Canal direto com especialistas para esclarecer qualquer dúvida.' },
          ],
        },
      },
      {
        id: `block-${Date.now()}-pricing`,
        type: 'pricing',
        variant: 'simple',
        props: {
          label: 'Planos & Investimento',
          title: 'Escolha a opção ideal para si',
          subtitle: 'Sem fidelização forçada. Cancele quando quiser.',
          plans: [
            { name: 'Essencial', price: '49€', period: '/mês', description: `Ideal para profissionais individuais em ${niche || segment}.`, features: ['Acesso completo', 'Suporte por email', 'Atualizações contínuas'], cta: 'Começar Agora' },
            { name: 'Profissional', price: '99€', period: '/mês', description: 'Para equipas que buscam escala e performance máxima.', highlighted: true, badge: 'Mais Escolhido', features: ['Tudo do Essencial', 'Suporte Prioritário 24/7', 'Consultoria mensal', 'Relatórios avançados'], cta: 'Garantir Plano Pro' },
          ],
        },
      },
      {
        id: `block-${Date.now()}-faq`,
        type: 'faq',
        variant: 'accordion',
        props: {
          label: 'Perguntas Frequentes',
          title: 'Esclareça as suas dúvidas',
          items: [
            { question: 'Como recebo o acesso após a adesão?', answer: 'O acesso é imediato e enviado para o seu email juntamente com as instruções de boas-vindas.' },
            { question: 'Existe garantia de reembolso?', answer: 'Sim! Oferecemos 14 dias de garantia total sem riscos. Se não ficar satisfeito, devolvemos 100% do valor.' },
            { question: 'Posso alterar de plano posteriormente?', answer: 'Sim, pode fazer upgrade ou downgrade do seu plano a qualquer momento no painel de controlo.' },
          ],
        },
      },
      {
        id: `block-${Date.now()}-cta`,
        type: 'cta',
        variant: 'simple',
        props: {
          headline: 'Não deixe esta oportunidade passar',
          subheadline: 'Garanta as condições especiais antes do encerramento desta edição.',
          buttonText: 'Garantir Minha Vaga',
        },
      },
      {
        id: `block-${Date.now()}-footer`,
        type: 'footer',
        variant: 'minimal',
        props: {
          logo: clientName || projectName || 'Blue IA',
          copyright: `© ${new Date().getFullYear()} ${clientName || projectName}. Pagamentos seguros.`,
        },
      },
    ],
  },
  {
    id: 'captura-leads',
    name: 'Captura de Leads & Lançamento',
    description: 'Página ultra direta e focada em colher contactos com headline forte e formulário simples.',
    category: 'Marketing',
    badge: 'Foco em Leads',
    generateBlocks: ({ projectName, clientName, segment, niche }) => [
      {
        id: `block-${Date.now()}-hero`,
        type: 'hero',
        variant: 'gradient',
        props: {
          badge: 'Material Gratuito Exclusivo',
          headline: `Guia Definitivo de ${niche || segment || 'Estratégia'} para ${new Date().getFullYear()}`,
          subheadline: `Descubra as práticas comprovadas para dominar o mercado de ${segment || 'negócios'} e acelerar os seus resultados.`,
          primaryCta: 'Descarregar Guia Grátis',
          secondaryCta: 'Saber Mais',
        },
      },
      {
        id: `block-${Date.now()}-features`,
        type: 'features',
        variant: 'grid',
        props: {
          label: 'O que vai aprender',
          title: 'Conteúdo prático e aplicável',
          items: [
            { icon: 'BookOpen', title: 'Capítulo 1: Fundamentos', description: 'Os pilares essenciais para estruturar a sua operação.' },
            { icon: 'TrendingUp', title: 'Capítulo 2: Estratégias de Escala', description: 'Metodologias práticas para atrair e reter clientes.' },
            { icon: 'CheckSquare', title: 'Capítulo 3: Checklist de Execução', description: 'Passo a passo pronto para implementar hoje.' },
          ],
        },
      },
      {
        id: `block-${Date.now()}-newsletter`,
        type: 'newsletter',
        variant: 'simple',
        props: {
          headline: 'Receba o material diretamente no seu email',
          subheadline: 'Junte-se a mais de 3.000 profissionais do setor. Zero spam.',
          buttonText: 'Quero Receber Agora',
        },
      },
      {
        id: `block-${Date.now()}-footer`,
        type: 'footer',
        variant: 'minimal',
        props: {
          logo: clientName || projectName || 'Blue IA',
          copyright: `© ${new Date().getFullYear()} ${clientName || projectName}. Respeitamos a sua privacidade.`,
        },
      },
    ],
  },
  {
    id: 'em-branco',
    name: 'Página Inicial Essencial',
    description: 'Estrutura limpa e mínima (Navbar, Hero e Rodapé) para construir o seu layout bloco a bloco.',
    category: 'Básico',
    generateBlocks: ({ projectName, clientName, segment, niche }) => [
      {
        id: `block-${Date.now()}-nav`,
        type: 'navbar',
        variant: 'default',
        props: {
          logo: clientName || projectName || 'Blue IA',
          links: ['Início', 'Sobre', 'Contacto'],
          ctaText: 'Começar',
        },
      },
      {
        id: `block-${Date.now()}-hero`,
        type: 'hero',
        variant: 'centered',
        props: {
          badge: segment || 'Nova Página',
          headline: `Bem-vindo à ${clientName || projectName}`,
          subheadline: `Página inicial para o projeto no segmento de ${niche || segment || 'serviços digitais'}.`,
          primaryCta: 'Explorar',
          secondaryCta: 'Contactar',
        },
      },
      {
        id: `block-${Date.now()}-footer`,
        type: 'footer',
        variant: 'simple',
        props: {
          logo: clientName || projectName || 'Blue IA',
          copyright: `© ${new Date().getFullYear()} ${clientName || projectName}. Todos os direitos reservados.`,
          links: ['Privacidade', 'Termos'],
        },
      },
    ],
  },
]
