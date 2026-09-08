import { Twitter, Facebook, Linkedin } from 'lucide-react'
import type { BlockConfig } from '../types'
import { InlineText } from '@/editor/InlineText'
import { useConfigStore } from '@/store/configStore'

interface TeamMember {
  id: string
  name: string
  role: string
  image?: string
}

interface TeamProps {
  title?: string
  subtitle?: string
  members?: TeamMember[]
  bottomText?: string
}

const defaultMembers: TeamMember[] = [
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
]

export function TeamGridBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const props = (block.props || {}) as unknown as TeamProps
  const members = props.members || defaultMembers

  return (
    <section id="team" className="py-24 px-6 sm:px-10 bg-[#f8f9fa] text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900">
            <InlineText
              value={props.title || 'OUR AMAZING TEAM'}
              as="span"
              onChange={(val) => updateBlockProps(block.id, { title: val })}
            />
          </h2>
          <p className="text-base sm:text-lg text-slate-500 italic max-w-xl mx-auto font-serif">
            <InlineText
              value={props.subtitle || 'Lorem ipsum dolor sit amet consectetur.'}
              as="span"
              onChange={(val) => updateBlockProps(block.id, { subtitle: val })}
            />
          </p>
        </div>

        {/* 3 Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {members.map((member) => (
            <div key={member.id} className="flex flex-col items-center space-y-3">
              {/* Circular Avatar */}
              <div className="w-52 h-52 rounded-full border-[7px] border-slate-200 overflow-hidden shadow-sm hover:scale-105 transition-transform duration-300">
                <img
                  src={member.image || '/assets/templates/agency/img/team/1.jpg'}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name & Role */}
              <div className="space-y-0.5 pt-2">
                <h4 className="text-xl font-bold text-slate-900">{member.name}</h4>
                <p className="text-sm text-slate-500 italic font-serif">{member.role}</p>
              </div>

              {/* Social links */}
              <div className="flex gap-2 pt-1">
                <a
                  href="#twitter"
                  aria-label={`Twitter de ${member.name}`}
                  className="w-10 h-10 rounded-full bg-[#212529] text-white hover:bg-[#ffc800] hover:text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href="#facebook"
                  aria-label={`Facebook de ${member.name}`}
                  className="w-10 h-10 rounded-full bg-[#212529] text-white hover:bg-[#ffc800] hover:text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="#linkedin"
                  aria-label={`LinkedIn de ${member.name}`}
                  className="w-10 h-10 rounded-full bg-[#212529] text-white hover:bg-[#ffc800] hover:text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <Linkedin size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Description */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <p className="text-base text-slate-500 leading-relaxed font-serif">
            <InlineText
              value={
                props.bottomText ||
                'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut eaque, laboriosam veritatis, quos non quis ad perspiciatis, totam corporis ea, alias ut unde.'
              }
              as="span"
              onChange={(val) => updateBlockProps(block.id, { bottomText: val })}
            />
          </p>
        </div>
      </div>
    </section>
  )
}
