import Image from 'next/image';

interface ShowcaseSectionProps {
  title: string;
  highlight: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

export function ShowcaseSection({
  title,
  highlight,
  description,
  imageSrc,
  imageAlt,
  reverse,
}: ShowcaseSectionProps) {
  return (
    <section className="py-16 lg:py-24">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${
          reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
        } items-center gap-12 lg:gap-16`}
      >
        <div className="lg:w-1/2 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            {title}{' '}
            <span className="text-teal-400">{highlight}</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
            {description}
          </p>
        </div>
        <div className="lg:w-1/2 relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl blur-xl" />
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={400}
            className="relative rounded-xl border border-slate-700/50 shadow-xl shadow-teal-500/5 w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
