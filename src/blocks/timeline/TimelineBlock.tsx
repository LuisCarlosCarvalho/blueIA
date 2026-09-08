import type { BlockConfig } from '../types'
import { InlineText } from '@/editor/InlineText'
import { useConfigStore } from '@/store/configStore'

interface TimelineEvent {
  id?: string
  date: string
  title: string
  description: string
  image?: string
}

interface TimelineProps {
  title?: string
  subtitle?: string
  events?: TimelineEvent[]
  finalCall?: string
}

const defaultEvents: TimelineEvent[] = [
  {
    id: 'evt-1',
    date: '2009-2011',
    title: 'Our Humble Beginnings',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente neque.',
    image: '/assets/templates/agency/img/about/1.jpg',
  },
  {
    id: 'evt-2',
    date: 'March 2011',
    title: 'An Agency is Born',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente neque.',
    image: '/assets/templates/agency/img/about/2.jpg',
  },
  {
    id: 'evt-3',
    date: 'December 2015',
    title: 'Transition to Full Service',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente neque.',
    image: '/assets/templates/agency/img/about/3.jpg',
  },
  {
    id: 'evt-4',
    date: 'July 2020',
    title: 'Phase Two Expansion',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente neque.',
    image: '/assets/templates/agency/img/about/4.jpg',
  },
]

export function TimelineBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const props = (block.props || {}) as unknown as TimelineProps
  const events = props.events || defaultEvents

  return (
    <section id="about" className="py-24 px-6 sm:px-10 bg-white text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900">
            <InlineText
              value={props.title || 'ABOUT'}
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

        {/* Timeline Container with Center Line */}
        <div className="relative">
          {/* Vertical central line on md+ */}
          <div className="hidden md:block absolute top-0 bottom-12 left-1/2 -translate-x-1/2 w-[2px] bg-slate-200" />

          <div className="space-y-16 md:space-y-24">
            {events.map((evt, index) => {
              const isEven = index % 2 === 0
              return (
                <div
                  key={evt.id || index}
                  className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 relative ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Text Content */}
                  <div
                    className={`flex-1 text-center ${
                      isEven ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
                      {evt.date}
                    </h4>
                    <h5 className="text-base sm:text-lg font-bold text-slate-700 mt-0.5 mb-2">
                      {evt.title}
                    </h5>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto md:mx-0">
                      {evt.description}
                    </p>
                  </div>

                  {/* Center Circle with Image or Number */}
                  <div className="w-24 h-24 sm:w-36 sm:h-36 sm:min-w-[144px] rounded-full border-[7px] border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 z-10 shadow-sm transition-transform hover:scale-105">
                    {evt.image ? (
                      <img
                        src={evt.image}
                        alt={evt.title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-lg font-bold text-primary">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Empty Spacer for balance */}
                  <div className="hidden md:block flex-1" />
                </div>
              )
            })}

            {/* Final Callout Circle */}
            <div className="flex justify-center pt-6">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#ffc800] text-white font-extrabold text-center text-xs sm:text-sm flex items-center justify-center p-4 shadow-md uppercase leading-tight tracking-wider border-[7px] border-slate-200 hover:scale-105 transition-transform select-none">
                <span className="leading-snug">
                  {props.finalCall || 'BE PART\nOF OUR\nSTORY!'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
