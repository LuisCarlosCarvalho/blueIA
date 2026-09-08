import type { SiteConfig } from '@/blocks/types'
import { themePresets, defaultTheme } from '@/lib/theme-presets'

export interface RegisteredTemplateMetadata {
  id: string
  name: string
  slug: string
  category: string
  status: 'draft' | 'published'
  origin: 'Importação HTML/ZIP' | 'Nativo' | 'JSON Elementor'
  schemaVersion: 'blue-bolt-template/v1'
  base: string
  sectionCount: number
  versionCount: number
  isGenericBase: boolean
  license: {
    originalName: string
    version: string
    source: string
    license: string
    copyright: string
  }
  build: (name?: string) => SiteConfig
}

export const agencyTemplateMetadata: RegisteredTemplateMetadata = {
  id: 'tpl-agency-v7',
  name: 'Agency — Portfólio e Serviços',
  slug: 'agency-portfolio-servicos',
  category: 'Portfólios',
  status: 'draft',
  origin: 'Importação HTML/ZIP',
  schemaVersion: 'blue-bolt-template/v1',
  base: 'Agency',
  sectionCount: 9,
  versionCount: 1,
  isGenericBase: false,
  license: {
    originalName: 'Start Bootstrap - Agency',
    version: '7.0.12',
    source: 'startbootstrap.com/theme/agency',
    license: 'MIT',
    copyright: '2013–2023 Start Bootstrap',
  },
  build: (name = 'Agency') => ({
    name: name || 'Agency — Portfólio e Serviços',
    theme: {
      ...(themePresets.find(p => p.id === 'amber')?.theme || defaultTheme),
      accent: '#ffc800',
      accentDim: '#d4a600',
    },
    blocks: [
      {
        id: 'block-agency-nav',
        type: 'navbar',
        variant: 'default',
        props: {
          logo: 'AGENCY',
          logoImage: '/assets/templates/agency/img/navbar-logo.svg',
          links: ['SERVICES', 'PORTFOLIO', 'ABOUT', 'TEAM', 'CONTACT'],
        },
      },
      {
        id: 'block-agency-hero',
        type: 'hero',
        variant: 'centered',
        props: {
          badge: 'Welcome To Our Studio!',
          headline: "IT'S NICE TO MEET YOU",
          subheadline: '',
          primaryCta: 'TELL ME MORE',
          primaryCtaLink: '#services',
          backgroundImage: '/assets/templates/agency/img/header-bg.jpg',
        },
      },
      {
        id: 'block-agency-services',
        type: 'services-grid',
        variant: 'default',
        props: {
          title: 'SERVICES',
          subtitle: 'Lorem ipsum dolor sit amet consectetur.',
          items: [
            {
              id: 'srv-1',
              icon: 'ecommerce',
              title: 'E-Commerce',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.',
            },
            {
              id: 'srv-2',
              icon: 'responsive',
              title: 'Responsive Design',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.',
            },
            {
              id: 'srv-3',
              icon: 'security',
              title: 'Web Security',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.',
            },
          ],
        },
      },
      {
        id: 'block-agency-portfolio',
        type: 'portfolio-grid',
        variant: 'default',
        props: {
          title: 'PORTFOLIO',
          subtitle: 'Lorem ipsum dolor sit amet consectetur.',
          items: [
            {
              id: 'proj-threads',
              title: 'Threads',
              category: 'Illustration',
              client: 'Threads',
              description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
              image: '/assets/templates/agency/img/portfolio/1.jpg',
            },
            {
              id: 'proj-explore',
              title: 'Explore',
              category: 'Graphic Design',
              client: 'Explore',
              description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
              image: '/assets/templates/agency/img/portfolio/2.jpg',
            },
            {
              id: 'proj-finish',
              title: 'Finish',
              category: 'Identity',
              client: 'Finish',
              description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
              image: '/assets/templates/agency/img/portfolio/3.jpg',
            },
            {
              id: 'proj-lines',
              title: 'Lines',
              category: 'Branding',
              client: 'Lines',
              description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
              image: '/assets/templates/agency/img/portfolio/4.jpg',
            },
            {
              id: 'proj-southwest',
              title: 'Southwest',
              category: 'Website Design',
              client: 'Southwest',
              description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
              image: '/assets/templates/agency/img/portfolio/5.jpg',
            },
            {
              id: 'proj-window',
              title: 'Window',
              category: 'Photography',
              client: 'Window',
              description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
              image: '/assets/templates/agency/img/portfolio/6.jpg',
            },
          ],
        },
      },
      {
        id: 'block-agency-about',
        type: 'timeline',
        variant: 'default',
        props: {
          title: 'ABOUT',
          subtitle: 'Lorem ipsum dolor sit amet consectetur.',
          finalCall: 'Be Part\nOf Our\nStory!',
          events: [
            {
              id: 'evt-1',
              date: '2009-2011',
              title: 'Our Humble Beginnings',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente, totam reiciendis temporibus qui quibusdam, recusandae sit vero unde, sed, incidunt et ea quo dolore laudantium consectetur!',
              image: '/assets/templates/agency/img/about/1.jpg',
            },
            {
              id: 'evt-2',
              date: 'March 2011',
              title: 'An Agency is Born',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente, totam reiciendis temporibus qui quibusdam, recusandae sit vero unde, sed, incidunt et ea quo dolore laudantium consectetur!',
              image: '/assets/templates/agency/img/about/2.jpg',
            },
            {
              id: 'evt-3',
              date: 'December 2015',
              title: 'Transition to Full Service',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente, totam reiciendis temporibus qui quibusdam, recusandae sit vero unde, sed, incidunt et ea quo dolore laudantium consectetur!',
              image: '/assets/templates/agency/img/about/3.jpg',
            },
            {
              id: 'evt-4',
              date: 'July 2020',
              title: 'Phase Two Expansion',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente, totam reiciendis temporibus qui quibusdam, recusandae sit vero unde, sed, incidunt et ea quo dolore laudantium consectetur!',
              image: '/assets/templates/agency/img/about/4.jpg',
            },
          ],
        },
      },
      {
        id: 'block-agency-team',
        type: 'team-grid',
        variant: 'default',
        props: {
          title: 'OUR AMAZING TEAM',
          subtitle: 'Lorem ipsum dolor sit amet consectetur.',
          bottomText: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut eaque, laboriosam veritatis, quos non quis ad perspiciatis, totam corporis ea, alias ut unde.',
          members: [
            {
              id: 'member-1',
              name: 'Parveen Anand',
              role: 'Lead Designer',
              image: '/assets/templates/agency/img/team/1.jpg',
            },
            {
              id: 'member-2',
              name: 'Diana Petersen',
              role: 'Lead Marketer',
              image: '/assets/templates/agency/img/team/2.jpg',
            },
            {
              id: 'member-3',
              name: 'Larry Parker',
              role: 'Lead Developer',
              image: '/assets/templates/agency/img/team/3.jpg',
            },
          ],
        },
      },
      {
        id: 'block-agency-clients',
        type: 'logo-strip',
        variant: 'default',
        props: {
          logos: [
            { id: 'logo-microsoft', name: 'Microsoft', svgPath: '/assets/templates/agency/img/logos/microsoft.svg' },
            { id: 'logo-google', name: 'Google', svgPath: '/assets/templates/agency/img/logos/google.svg' },
            { id: 'logo-facebook', name: 'Facebook', svgPath: '/assets/templates/agency/img/logos/facebook.svg' },
            { id: 'logo-ibm', name: 'IBM', svgPath: '/assets/templates/agency/img/logos/ibm.svg' },
          ],
        },
      },
      {
        id: 'block-agency-contact',
        type: 'contact-form',
        variant: 'default',
        props: {
          title: 'CONTACT US',
          subtitle: 'Lorem ipsum dolor sit amet consectetur.',
          buttonText: 'SEND MESSAGE',
          bgImage: '/assets/templates/agency/img/map-image.png',
        },
      },
      {
        id: 'block-agency-footer',
        type: 'footer',
        variant: 'multi-column',
        props: {
          copyright: 'Copyright © Your Website 2023',
          links: ['Privacy Policy', 'Terms of Use'],
        },
      },
    ],
  }),
}
