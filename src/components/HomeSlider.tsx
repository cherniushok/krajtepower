"use client";

type Slide = { id: string };

export default function HomeSlider({
  slides,
  activeIndex,
  onChange,
}: {
  slides: Slide[];
  activeIndex: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="rounded-full bg-white/70 px-4 py-3 shadow-sm backdrop-blur 
                flex 
                h-auto w-full justify-center
                md:h-[420px] md:w-auto md:px-3 md:py-5">
      <div className="flex w-full flex-row items-center justify-between gap-4
                md:h-full md:flex-col md:items-center md:justify-between">
        {slides.map((s, idx) => {
          const active = idx === activeIndex;

          return (
            <button
              key={s.id}
              onClick={() => onChange(idx)}
              aria-label={`Slide ${idx + 1}`}
              className="group flex items-center justify-center"
            >
              <span
                className={[
                  "rounded-full transition-all duration-300",
                  "h-4 w-4",
                  "border border-black/30",
                  active
                    ? "bg-black scale-110"
                    : "bg-[#F7F5F1] group-hover:bg-black/20 group-hover:scale-110",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}