import type { SiteConfig } from '@/blocks/types'
import { themePresets } from './theme-presets'

interface Template {
  keywords: string[]
  themePresetId: string
  build: (name: string) => SiteConfig
}

function getTheme(id: string) {
  return themePresets.find((p) => p.id === id)?.theme
}

const templates: Template[] = [
  {
    keywords: ['portfolio', 'personal', 'resume', 'freelance', 'designer', 'developer'],
    themePresetId: 'slate',
    build: (name) => ({
      name,
      theme: getTheme('slate'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Work', 'About', 'Contact'], ctaText: 'Hire Me' } },
        { id: 'block-hero-1', type: 'hero', variant: 'minimal', props: { headline: `Hi, I'm ${name}`, subheadline: 'I design and build digital experiences that make a difference.', primaryCta: 'View My Work' } },
        { id: 'block-gallery-1', type: 'gallery', variant: 'grid', props: { title: 'Selected Work' } },
        { id: 'block-stats-1', type: 'stats', variant: 'counter', props: { title: 'By the Numbers', items: [{ value: '50+', label: 'Projects completed' }, { value: '8', label: 'Years experience' }, { value: '30+', label: 'Happy clients' }, { value: '5', label: 'Awards won' }] } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'spotlight', props: { title: 'Client Feedback', items: [{ name: 'Alex Rivera', role: 'CEO at Startup', quote: 'Exceptional work. Delivered on time with incredible attention to detail.', rating: 5 }] } },
        { id: 'block-contact-1', type: 'contact', variant: 'form', props: { title: 'Get in Touch', subtitle: "Have a project in mind? Let's talk." } },
        { id: 'block-footer-1', type: 'footer', variant: 'minimal', props: { logo: name, copyright: `2026 ${name}. All rights reserved.`, links: ['LinkedIn', 'GitHub', 'Twitter'] } },
      ],
    }),
  },
  {
    keywords: ['restaurant', 'food', 'cafe', 'bakery', 'bar', 'bistro', 'pizza', 'sushi', 'kitchen'],
    themePresetId: 'amber',
    build: (name) => ({
      name,
      theme: getTheme('amber'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'centered', props: { logo: name, links: ['Menu', 'About', 'Reservations', 'Gallery'], ctaText: 'Book a Table' } },
        { id: 'block-hero-1', type: 'hero', variant: 'gradient', props: { headline: `Welcome to ${name}`, subheadline: 'Fresh ingredients, bold flavors, unforgettable dining experiences.', primaryCta: 'View Menu', secondaryCta: 'Make a Reservation' } },
        { id: 'block-features-1', type: 'features', variant: 'list', props: { title: 'Why Choose Us', items: [{ icon: 'Star', title: 'Farm to Table', description: 'We source locally from sustainable farms.' }, { icon: 'Globe', title: 'World Cuisine', description: 'Inspired by flavors from around the globe.' }, { icon: 'Zap', title: 'Fresh Daily', description: 'Our menu changes with the seasons.' }] } },
        { id: 'block-gallery-1', type: 'gallery', variant: 'masonry', props: { title: 'From Our Kitchen' } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'spotlight', props: { items: [{ name: 'Maria Garcia', role: 'Food Critic', quote: 'A culinary gem. Every dish is a masterpiece of flavor and presentation.', rating: 5 }] } },
        { id: 'block-cta-1', type: 'cta', variant: 'simple', props: { headline: 'Reserve Your Table', subheadline: 'Open Tuesday through Sunday, 5pm to 11pm.', buttonText: 'Book Now' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `2026 ${name}. All rights reserved.`, links: ['Menu', 'Reservations', 'Privacy'] } },
      ],
    }),
  },
  {
    keywords: ['agency', 'studio', 'consulting', 'firm', 'digital', 'creative', 'marketing'],
    themePresetId: 'clean',
    build: (name) => ({
      name,
      theme: getTheme('clean'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'centered', props: { logo: name, links: ['Services', 'Work', 'About', 'Contact'], ctaText: 'Get a Quote' } },
        { id: 'block-hero-1', type: 'hero', variant: 'split', props: { badge: 'Award-Winning Agency', headline: 'We build brands that matter', subheadline: 'Strategy, design, and technology working together to drive real results.', primaryCta: 'Start a Project', secondaryCta: 'Our Work' } },
        { id: 'block-logocloud-1', type: 'logocloud', variant: 'default', props: { title: 'Trusted by Industry Leaders' } },
        { id: 'block-features-1', type: 'features', variant: 'alternating', props: { label: 'Services', title: 'What We Do', subtitle: 'End-to-end digital solutions', items: [{ icon: 'Palette', title: 'Brand Strategy', description: 'We craft brand identities that resonate with your audience and stand the test of time.' }, { icon: 'Code', title: 'Web Development', description: 'Modern, performant websites built with the latest technologies.' }, { icon: 'Rocket', title: 'Growth Marketing', description: 'Data-driven campaigns that deliver measurable results.' }] } },
        { id: 'block-stats-1', type: 'stats', variant: 'counter', props: { items: [{ value: '200+', label: 'Projects delivered' }, { value: '95%', label: 'Client retention' }, { value: '12', label: 'Team members' }, { value: '8', label: 'Years in business' }] } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'cards', props: { title: 'What Clients Say', items: [{ name: 'James Park', role: 'VP Marketing, TechCo', quote: 'They transformed our entire digital presence. ROI exceeded expectations by 3x.', rating: 5 }, { name: 'Lisa Chen', role: 'Founder, StartupXYZ', quote: 'Professional, creative, and incredibly responsive. Our go-to agency.', rating: 5 }, { name: 'David Kim', role: 'CMO, Enterprise Inc', quote: 'The strategic thinking behind their work sets them apart from other agencies.', rating: 5 }] } },
        { id: 'block-cta-1', type: 'cta', variant: 'split', props: { headline: "Let's build something great together", subheadline: 'Schedule a free consultation to discuss your next project.', buttonText: 'Get Started' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `2026 ${name}. All rights reserved.`, links: ['Services', 'Work', 'Blog', 'Careers', 'Privacy', 'Terms'] } },
      ],
    }),
  },
  {
    keywords: ['blog', 'newsletter', 'magazine', 'journal', 'publication', 'writer', 'author'],
    themePresetId: 'ivory',
    build: (name) => ({
      name,
      theme: getTheme('ivory'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Articles', 'Topics', 'About'], ctaText: 'Subscribe' } },
        { id: 'block-hero-1', type: 'hero', variant: 'minimal', props: { headline: name, subheadline: 'Thoughtful writing on technology, design, and the future of work.', primaryCta: 'Start Reading' } },
        { id: 'block-content-1', type: 'content', variant: 'columns', props: { body: '## Latest Thinking\n\nExploring ideas at the intersection of technology and humanity. From AI ethics to sustainable design, we cover what matters.\n\n## Featured Topics\n\n- **Technology** - The tools shaping our future\n- **Design** - Making things beautiful and useful\n- **Culture** - How work and life are evolving' } },
        { id: 'block-divider-1', type: 'divider', variant: 'dots', props: { height: 40 } },
        { id: 'block-newsletter-1', type: 'newsletter', variant: 'simple', props: { title: 'Join 5,000+ readers', subtitle: 'Get weekly insights delivered to your inbox. No spam, ever.', buttonText: 'Subscribe Free' } },
        { id: 'block-faq-1', type: 'faq', variant: 'accordion', props: { title: 'Frequently Asked Questions', items: [{ question: 'How often do you publish?', answer: 'We publish 2-3 articles per week, plus a weekly newsletter digest.' }, { question: 'Can I contribute?', answer: 'Yes! We welcome guest contributions from thoughtful writers.' }, { question: 'Is it free?', answer: 'All articles are free. We offer a premium newsletter with deeper analysis.' }] } },
        { id: 'block-footer-1', type: 'footer', variant: 'simple', props: { logo: name, copyright: `2026 ${name}. All rights reserved.`, links: ['RSS', 'Twitter', 'Privacy'] } },
      ],
    }),
  },
  {
    // Default: SaaS landing page
    keywords: [],
    themePresetId: 'default',
    build: (name) => ({
      name,
      theme: getTheme('default'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Features', 'Pricing', 'About'], ctaText: 'Get Started' } },
        { id: 'block-hero-1', type: 'hero', variant: 'centered', props: { badge: 'Now in Beta', headline: `${name} - Build Better, Ship Faster`, subheadline: 'The all-in-one platform that helps teams move from idea to production in record time.', primaryCta: 'Start Free Trial', secondaryCta: 'Watch Demo' } },
        { id: 'block-logocloud-1', type: 'logocloud', variant: 'default', props: { title: 'Trusted by innovative teams' } },
        { id: 'block-features-1', type: 'features', variant: 'grid', props: { label: 'Features', title: 'Everything you need', subtitle: 'Powerful tools that grow with your team', items: [{ icon: 'Zap', title: 'Lightning Fast', description: 'Sub-100ms response times. Your team never waits.' }, { icon: 'Shield', title: 'Enterprise Security', description: 'SOC 2 compliant with end-to-end encryption.' }, { icon: 'Globe', title: 'Global Scale', description: 'Deploy to 30+ regions worldwide.' }, { icon: 'Bot', title: 'AI-Powered', description: 'Smart automation that learns your workflow.' }, { icon: 'Layers', title: 'Integrations', description: '200+ integrations with your favorite tools.' }, { icon: 'Rocket', title: 'Fast Setup', description: 'Go from signup to production in under 5 minutes.' }] } },
        { id: 'block-pricing-1', type: 'pricing', variant: 'simple', props: { title: 'Simple, transparent pricing', subtitle: 'No hidden fees. Cancel anytime.' } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'cards', props: { title: 'Loved by developers', items: [{ name: 'Sarah Chen', role: 'CTO at TechCorp', quote: 'Cut our deployment time by 80%. The team productivity gains are incredible.', rating: 5 }, { name: 'Marcus Johnson', role: 'Lead Developer', quote: 'Best developer experience I have ever used. Period.', rating: 5 }, { name: 'Emma Wilson', role: 'Product Manager', quote: 'Finally, a tool the whole team can align on. Worth every penny.', rating: 5 }] } },
        { id: 'block-cta-1', type: 'cta', variant: 'simple', props: { headline: 'Ready to get started?', subheadline: 'Join thousands of teams shipping faster.', buttonText: 'Start Free Trial' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `2026 ${name}. All rights reserved.`, links: ['Features', 'Pricing', 'Docs', 'Blog', 'Privacy', 'Terms'] } },
      ],
    }),
  },
]

// Metadata for the 8 featured template cards on Dashboard
export interface DashboardTemplateItem {
  id: string
  name: string
  subtitle: string
  category: string
  accent: string
  themePresetId: string
  previewStyle: 'writemate' | 'fincash' | 'nexstudio' | 'genesis' | 'techself' | 'pixels' | 'agentix' | 'mapple'
  build: (name: string) => SiteConfig
}

export const dashboardTemplates: DashboardTemplateItem[] = [
  {
    id: 'writemate-ai',
    name: 'Writemate AI',
    subtitle: 'Template',
    category: 'IA & Copywriting',
    accent: '#6366f1',
    themePresetId: 'indigo',
    previewStyle: 'writemate',
    build: (name = 'Writemate AI') => ({
      name,
      theme: getTheme('indigo'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Recursos', 'Modelos', 'Preços', 'Empresas'], ctaText: 'Testar Grátis' } },
        { id: 'block-hero-1', type: 'hero', variant: 'centered', props: { badge: 'Nova Geração de IA', headline: 'Crie Conteúdo de Alta Conversão com IA', subheadline: 'A plataforma inteligente que transforma ideias em copywriting persuasivo em segundos.', primaryCta: 'Começar Agora Grátis', secondaryCta: 'Ver Demonstração' } },
        { id: 'block-logocloud-1', type: 'logocloud', variant: 'default', props: { title: 'Usado por mais de 50.000 criadores e marcas' } },
        { id: 'block-features-1', type: 'features', variant: 'grid', props: { label: 'Funcionalidades', title: 'Tudo o que precisa para escrever melhor', subtitle: 'Potência neural com foco em retenção e vendas.', items: [{ icon: 'Zap', title: 'Geração Ultra Rápida', description: 'Crie artigos, anúncios e landing pages em menos de 10 segundos.' }, { icon: 'Bot', title: 'Agente Treinado em Vendas', description: 'Gatilhos mentais e estruturas testadas para converter mais.' }, { icon: 'Shield', title: 'Plágio Zero & SEO', description: 'Textos originais e otimizados para topo do Google.' }] } },
        { id: 'block-stats-1', type: 'stats', variant: 'grid', props: { stats: [{ value: '10x', label: 'Mais Rápido' }, { value: '+45%', label: 'Taxa de Conversão' }, { value: '50k+', label: 'Utilizadores Ativos' }, { value: '99.9%', label: 'Satisfação' }] } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'cards', props: { title: 'O que dizem os maiores copywriters', items: [{ quote: 'Mudou radicalmente a nossa velocidade de produção. ROI indiscutível.', name: 'Diogo Silva', role: 'Head de Growth' }, { quote: 'O melhor assistente de copywriting em português que já experimentámos.', name: 'Mariana Costa', role: 'Diretora Criativa' }] } },
        { id: 'block-pricing-1', type: 'pricing', variant: 'simple', props: { title: 'Planos simples e flexíveis', subtitle: 'Cancele quando quiser. Sem contratos ocultos.' } },
        { id: 'block-cta-1', type: 'cta', variant: 'simple', props: { headline: 'Pronto para multiplicar os seus resultados?', subheadline: 'Experimente gratuitamente durante 14 dias sem necessidade de cartão.', buttonText: 'Criar Conta Grátis' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `© 2026 ${name}. Todos os direitos reservados.`, links: ['Termos', 'Privacidade', 'Segurança', 'Contacto'] } },
      ],
    }),
  },
  {
    id: 'fincash',
    name: 'Fincash',
    subtitle: 'Template',
    category: 'Fintech & Mobile',
    accent: '#10b981',
    themePresetId: 'emerald',
    previewStyle: 'fincash',
    build: (name = 'Fincash') => ({
      name,
      theme: getTheme('emerald'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'centered', props: { logo: name, links: ['Conta Digital', 'Investimentos', 'Cartões', 'Segurança'], ctaText: 'Abrir Conta' } },
        { id: 'block-hero-1', type: 'hero', variant: 'split', props: { badge: 'Fintech Autorizada', headline: 'O Futuro da Sua Vida Financeira Começa Aqui', subheadline: 'Controle despesas, invista globalmente e receba rendimentos diários num único aplicativo simples.', primaryCta: 'Descarregar App', secondaryCta: 'Comparar Vantagens' } },
        { id: 'block-features-1', type: 'features', variant: 'alternating', props: { label: 'Vantagens', title: 'Tecnologia que valoriza o seu dinheiro', items: [{ icon: 'Shield', title: 'Segurança de Nível Bancário', description: 'Criptografia de ponta a ponta e proteção de saldos até 100.000€.' }, { icon: 'TrendingUp', title: 'Rendimento Automático', description: 'O seu saldo rende 4.2% ao ano desde o primeiro dia.' }, { icon: 'CreditCard', title: 'Cartão Sem Anuidade', description: 'Cashback em todas as compras e câmbio comercial zero spread.' }] } },
        { id: 'block-stats-1', type: 'stats', variant: 'counter', props: { items: [{ value: '2.5M€+', label: 'Transacionados' }, { value: '180k+', label: 'Clientes Ativos' }, { value: '0€', label: 'Comissões de Manutenção' }, { value: '4.9/5', label: 'Avaliação na App Store' }] } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'spotlight', props: { items: [{ name: 'Carlos Antunes', role: 'Investidor e Empreendedor', quote: 'A melhor experiência financeira móvel. Simples, rápido e com rentabilidade garantida.', rating: 5 }] } },
        { id: 'block-cta-1', type: 'cta', variant: 'split', props: { headline: 'Abra a sua conta em menos de 3 minutos', subheadline: 'Sem papelada, sem burocracia e 100% digital.', buttonText: 'Abrir Minha Conta' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `© 2026 ${name} Instituição de Pagamento.`, links: ['Transparência', 'Taxas', 'Termos', 'Ouvidoria'] } },
      ],
    }),
  },
  {
    id: 'nexstudio',
    name: 'NexStudio',
    subtitle: 'Template',
    category: 'Design & Estratégia',
    accent: '#94a3b8',
    themePresetId: 'slate',
    previewStyle: 'nexstudio',
    build: (name = 'NexStudio') => ({
      name,
      theme: getTheme('slate'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Projetos', 'Serviços', 'Manifesto', 'Contacto'], ctaText: 'Iniciar Projeto' } },
        { id: 'block-hero-1', type: 'hero', variant: 'minimal', props: { headline: 'Design e Tecnologia para Marcas Visionárias', subheadline: 'Criamos identidades visuais marcantes, websites de alto impacto e produtos digitais que definem categorias.', primaryCta: 'Ver Casos de Estudo', secondaryCta: 'Falar Connosco' } },
        { id: 'block-gallery-1', type: 'gallery', variant: 'grid', props: { title: 'Projetos Selecionados' } },
        { id: 'block-features-1', type: 'features', variant: 'list', props: { title: 'As Nossas Disciplinas', items: [{ icon: 'Palette', title: 'Brand Identity', description: 'Sistemas visuais completos e memoráveis.' }, { icon: 'Code', title: 'Digital Architecture', description: 'Desenvolvimento moderno com máxima performance.' }, { icon: 'Layers', title: 'Design Systems', description: 'Escalabilidade e consistência para produtos digitais.' }] } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'spotlight', props: { items: [{ name: 'Sofia Vilar', role: 'Fundadora da Aura Tech', quote: 'A NexStudio elevou a nossa marca a um padrão internacional indiscutível.', rating: 5 }] } },
        { id: 'block-cta-1', type: 'cta', variant: 'simple', props: { headline: 'Tem um desafio para nós?', subheadline: 'Vamos construir algo inesquecível juntos.', buttonText: 'Agendar Conversa' } },
        { id: 'block-footer-1', type: 'footer', variant: 'minimal', props: { logo: name, copyright: `© 2026 ${name}. Lisboa — Londres.`, links: ['Instagram', 'Behance', 'LinkedIn'] } },
      ],
    }),
  },
  {
    id: 'genesis',
    name: 'Genesis',
    subtitle: 'Template',
    category: 'Cloud & Tech',
    accent: '#8b5cf6',
    themePresetId: 'violet',
    previewStyle: 'genesis',
    build: (name = 'Genesis') => ({
      name,
      theme: getTheme('violet'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Arquitetura', 'Documentação', 'Ecossistema', 'Preços'], ctaText: 'Deploy em 1-Clique' } },
        { id: 'block-hero-1', type: 'hero', variant: 'centered', props: { badge: 'Plataforma Serverless Global', headline: 'Infraestrutura Inteligente para Agentes e Microsserviços', subheadline: 'Orquestre código, bancos de dados distribuídos e modelos de inteligência artificial com latência sub-milisegundo.', primaryCta: 'Criar Cluster Grátis', secondaryCta: 'Documentação' } },
        { id: 'block-logocloud-1', type: 'logocloud', variant: 'default', props: { title: 'Confiado por equipas de engenharia de elite' } },
        { id: 'block-features-1', type: 'features', variant: 'grid', props: { label: 'Capacidades', title: 'Construído para resiliência extrema', items: [{ icon: 'Zap', title: 'Edge Computing Global', description: 'Mais de 250 pontos de presença em todo o mundo.' }, { icon: 'Bot', title: 'Run times para LLMs', description: 'Execução otimizada de agentes neurais e vector search.' }, { icon: 'Lock', title: 'Isolamento MicroVM', description: 'Segurança absoluta e zero trust por instância.' }] } },
        { id: 'block-pricing-1', type: 'pricing', variant: 'simple', props: { title: 'Preços baseados no consumo', subtitle: 'Pague apenas pelos recursos que os seus nós utilizarem.' } },
        { id: 'block-cta-1', type: 'cta', variant: 'simple', props: { headline: 'Comece a construir na Genesis hoje', subheadline: '100$ em créditos de computação grátis no registo.', buttonText: 'Iniciar Agora' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `© 2026 ${name} Cloud Systems Inc.`, links: ['Status', 'API Docs', 'Segurança', 'GitHub'] } },
      ],
    }),
  },
  {
    id: 'techself',
    name: 'TechSelf',
    subtitle: 'Template',
    category: 'E-commerce & Hardware',
    accent: '#3b82f6',
    themePresetId: 'clean',
    previewStyle: 'techself',
    build: (name = 'TechSelf') => ({
      name,
      theme: getTheme('clean'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Novidades', 'Dispositivos', 'Acessórios', 'Suporte'], ctaText: 'Ver Loja' } },
        { id: 'block-hero-1', type: 'hero', variant: 'split', props: { badge: 'Lançamento Exclusivo', headline: 'Tecnologia Minimalista para o Seu Espaço de Trabalho', subheadline: 'Equipamentos concebidos com materiais nobres, precisão milimétrica e estética refinada.', primaryCta: 'Explorar Coleção', secondaryCta: 'Especificações' } },
        { id: 'block-gallery-1', type: 'gallery', variant: 'masonry', props: { title: 'Galeria de Produtos' } },
        { id: 'block-features-1', type: 'features', variant: 'grid', props: { label: 'Qualidade', title: 'Engenharia e Sustentabilidade', items: [{ icon: 'Shield', title: 'Garantia de 3 Anos', description: 'Substituição imediata e assistência técnica dedicada.' }, { icon: 'Sparkles', title: 'Alumínio Reciclado', description: 'Materiais sustentáveis de categoria aeroespacial.' }, { icon: 'Zap', title: 'Carregamento Sem Fios', description: 'Compatibilidade universal com norma Qi2.' }] } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'cards', props: { title: 'O que dizem os especialistas de tecnologia', items: [{ quote: 'O acabamento deste teclado e monitor stand redefine o conceito de secretária premium.', name: 'Gonçalo Ramos', role: 'Tech Reviewer' }, { quote: 'Design nórdico puro com funcionalidade impressionante.', name: 'Ana Barreto', role: 'Arquiteta' }] } },
        { id: 'block-cta-1', type: 'cta', variant: 'simple', props: { headline: 'Transforme o seu setup profissional', subheadline: 'Portes grátis para toda a Europa em compras superiores a 50€.', buttonText: 'Comprar Agora' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `© 2026 ${name} Lifestyle Tech.`, links: ['Envios', 'Devoluções', 'Garantia', 'FAQ'] } },
      ],
    }),
  },
  {
    id: 'pixels',
    name: 'Pixels',
    subtitle: 'Template',
    category: 'Portfólio & Arte',
    accent: '#f43f5e',
    themePresetId: 'ivory',
    previewStyle: 'pixels',
    build: (name = 'Pixels') => ({
      name,
      theme: getTheme('ivory'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Galeria', 'Exposições', 'Bio', 'Contacto'], ctaText: 'Encomendar Obra' } },
        { id: 'block-hero-1', type: 'hero', variant: 'minimal', props: { headline: 'Fotografia Autoral e Narrativas Visuais', subheadline: 'Capturando momentos singulares, arquitetura urbana e retratos profundos através da luz natural.', primaryCta: 'Ver Portfólio Completo', secondaryCta: 'Sobre o Autor' } },
        { id: 'block-gallery-1', type: 'gallery', variant: 'grid', props: { title: 'Séries em Destaque' } },
        { id: 'block-stats-1', type: 'stats', variant: 'counter', props: { items: [{ value: '14', label: 'Prémios Internacionais' }, { value: '8', label: 'Exposições Individuais' }, { value: '25+', label: 'Países Fotografados' }, { value: '120+', label: 'Obras em Coleções Privadas' }] } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'spotlight', props: { items: [{ name: 'Helena Paiva', role: 'Curadora de Arte Moderna', quote: 'Um olhar poético e intransigente sobre o espaço contemporâneo.', rating: 5 }] } },
        { id: 'block-contact-1', type: 'contact', variant: 'form', props: { title: 'Vamos conversar sobre o seu próximo projeto visual', subtitle: 'Disponível para encomendas comerciais e editoriais.' } },
        { id: 'block-footer-1', type: 'footer', variant: 'minimal', props: { logo: name, copyright: `© 2026 ${name}. Direitos reservados.`, links: ['Instagram', 'Artsy', 'Vimeo'] } },
      ],
    }),
  },
  {
    id: 'agentix',
    name: 'Agentix',
    subtitle: 'Template',
    category: 'IA & Automações',
    accent: '#3b82f6',
    themePresetId: 'default',
    previewStyle: 'agentix',
    build: (name = 'Agentix') => ({
      name,
      theme: getTheme('default'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'default', props: { logo: name, links: ['Agentes', 'Workflows', 'Integrações', 'Preços'], ctaText: 'Testar Plataforma' } },
        { id: 'block-hero-1', type: 'hero', variant: 'centered', props: { badge: 'Ecossistema Multi-Agente', headline: 'Automatize Operações Complexas com Agentes Autónomos', subheadline: 'Conecte fluxos de atendimento, vendas e análise de dados em minutos sem necessidade de código.', primaryCta: 'Criar Meu Primeiro Agente', secondaryCta: 'Ver Casos de Uso' } },
        { id: 'block-features-1', type: 'features', variant: 'grid', props: { label: 'Capacidades', title: 'Trabalho inteligente a qualquer escala', items: [{ icon: 'Bot', title: 'Agentes Especializados', description: 'Modelos ajustados para suporte, SDR e triagem financeira.' }, { icon: 'Layers', title: 'Integrações Nativas', description: 'Conexão direta com CRM, Slack, WhatsApp e ERPs.' }, { icon: 'Shield', title: 'Controlo & Auditoria', description: 'Logs completos de decisões e aprovações humanas.' }] } },
        { id: 'block-pricing-1', type: 'pricing', variant: 'simple', props: { title: 'Planos dimensionados para o seu crescimento', subtitle: 'Comece grátis e escale à medida que a automação gera valor.' } },
        { id: 'block-cta-1', type: 'cta', variant: 'simple', props: { headline: 'Junte-se à revolução dos agentes de IA', subheadline: 'Mais de 1.000 empresas já poupam 40 horas semanais com o Agentix.', buttonText: 'Começar Agora' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `© 2026 ${name} Automation Technologies.`, links: ['Segurança', 'Privacidade', 'Docs', 'Suporte'] } },
      ],
    }),
  },
  {
    id: 'mapple',
    name: 'Mapple',
    subtitle: 'Template',
    category: 'Consultoria & Estratégia',
    accent: '#10b981',
    themePresetId: 'clean',
    previewStyle: 'mapple',
    build: (name = 'Mapple') => ({
      name,
      theme: getTheme('clean'),
      blocks: [
        { id: 'block-navbar-1', type: 'navbar', variant: 'centered', props: { logo: name, links: ['Metodologia', 'Soluções', 'Resultados', 'Equipa'], ctaText: 'Agendar Diagnóstico' } },
        { id: 'block-hero-1', type: 'hero', variant: 'split', props: { badge: 'Consultoria Estratégica', headline: 'Escalamos Empresas Líderes através de Inovação Prática', subheadline: 'Ajudamos fundadores e equipas executivas a acelerar receita, otimizar processos e entrar em novos mercados.', primaryCta: 'Solicitar Diagnóstico Gratuito', secondaryCta: 'Nossos Resultados' } },
        { id: 'block-features-1', type: 'features', variant: 'alternating', props: { label: 'Áreas de Atuação', title: 'Resultados mensuráveis para o seu negócio', items: [{ icon: 'TrendingUp', title: 'Aceleração de Receita', description: 'Revisão de pricing, canais de aquisição e expansão B2B.' }, { icon: 'Layers', title: 'Transformação Digital', description: 'Implementação de processos ágeis e ferramentas modernas.' }, { icon: 'Users', title: 'Liderança & Cultura', description: 'Alinhamento de equipas para execução de alta performance.' }] } },
        { id: 'block-stats-1', type: 'stats', variant: 'counter', props: { items: [{ value: '450M€+', label: 'Valor Gerado' }, { value: '94%', label: 'Taxa de Sucesso nos Projetos' }, { value: '12+', label: 'Anos de Mercado' }, { value: '65+', label: 'Empresas Aceleradas' }] } },
        { id: 'block-testimonials-1', type: 'testimonials', variant: 'cards', props: { title: 'Depoimentos de CEOs e Fundadores', items: [{ quote: 'A Mapple redefiniu a nossa estratégia comercial e triplicámos as vendas em 18 meses.', name: 'Bernardo Guimarães', role: 'CEO, Veloce Tech' }, { quote: 'Clareza analítica e execução implacável. Parceiros indispensáveis.', name: 'Inês Caldeira', role: 'COO, Prime Logistics' }] } },
        { id: 'block-cta-1', type: 'cta', variant: 'split', props: { headline: 'Pronto para o próximo ciclo de crescimento?', subheadline: 'Agende uma sessão estratégica confidencial com os nossos sócios.', buttonText: 'Marcar Diagnóstico' } },
        { id: 'block-footer-1', type: 'footer', variant: 'multi-column', props: { logo: name, copyright: `© 2026 ${name} Strategic Consulting.`, links: ['Metodologia', 'Artigos', 'Carreiras', 'Contacto'] } },
      ],
    }),
  },
]

export const templateMeta = dashboardTemplates.map((t, index) => ({
  id: t.id,
  name: t.name,
  description: t.category,
  accent: t.accent,
  blockCount: 7,
  templateIndex: index,
  icon: 'Layers',
}))

/** Adiciona campos canónicos Blue Bolt ao resultado de qualquer build de template */
function withCanonicalFields(config: SiteConfig): SiteConfig {
  return {
    ...config,
    schemaVersion: 'blue-bolt-template/v1',
    originTechnology: 'blue-bolt-json',
  }
}

export function buildTemplate(id: string, name: string): SiteConfig {
  const t = dashboardTemplates.find((item) => item.id === id)
  if (t) return withCanonicalFields(t.build(name))
  const meta = templateMeta.find((m) => m.id === id)
  if (!meta) return withCanonicalFields(templates[templates.length - 1].build(name))
  return withCanonicalFields(templates[meta.templateIndex]?.build(name) || templates[0].build(name))
}

function extractName(prompt: string): string {
  const words = prompt.split(/\s+/).slice(0, 4).join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function getTemplateForPrompt(prompt: string): SiteConfig {
  const lower = prompt.toLowerCase()
  const name = extractName(prompt)

  // Find first template with a keyword match
  for (const template of templates) {
    if (template.keywords.length === 0) continue
    if (template.keywords.some((kw) => lower.includes(kw))) {
      return withCanonicalFields(template.build(name))
    }
  }

  // Default: SaaS template (last in array)
  return withCanonicalFields(templates[templates.length - 1].build(name))
}
