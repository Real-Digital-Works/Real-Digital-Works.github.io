"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRef } from "react";
import { Faq } from "@/components/Faq";
import { HeroScene } from "@/components/HeroScene";
import { Marquee } from "@/components/Marquee";
import { OfferBoard } from "@/components/OfferBoard";
import { StudioChat } from "@/components/StudioChat";
import { process, projects, proof, services, stack, hero } from "@/lib/content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomeView() {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const indexEl = useRef<HTMLSpanElement>(null);
  const barEl = useRef<HTMLSpanElement>(null);
  const featured = projects[0];

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      gsap.to(".hero-grid", {
        yPercent: 22,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-block",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      gsap.to(".hero-stage", {
        y: -80,
        opacity: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-block",
          start: "top top",
          end: "bottom top",
          scrub: 0.7,
        },
      });

      const pinEl = pin.current;
      const trackEl = track.current;
      if (pinEl && trackEl) {
        const cards = gsap.utils.toArray<HTMLElement>(".offer-card");

        const focusCards = () => {
          const mid = window.innerWidth * 0.38;
          let best = 0;
          let bestScore = -1;
          cards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const dist = Math.abs(center - mid);
            const t = gsap.utils.clamp(0, 1, 1 - dist / (rect.width * 0.85));
            gsap.set(card, {
              scale: 0.9 + t * 0.1,
              opacity: 0.38 + t * 0.62,
            });
            if (t > bestScore) {
              bestScore = t;
              best = i;
            }
          });
          if (indexEl.current) {
            indexEl.current.textContent = String(best + 1).padStart(2, "0");
          }
        };

        gsap.to(trackEl, {
          x: () => -(trackEl.scrollWidth - window.innerWidth + 48),
          ease: "none",
          scrollTrigger: {
            trigger: pinEl,
            start: "top 64px",
            end: () => `+=${Math.max(trackEl.scrollWidth * 1.15, window.innerWidth * 1.6)}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              focusCards();
              if (barEl.current) {
                barEl.current.style.width = `${self.progress * 100}%`;
              }
            },
            onRefresh: focusCards,
          },
        });

        focusCards();
      }

      gsap.fromTo(
        ".desk-block",
        { y: 60, opacity: 0.35 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".desk-block",
            start: "top 88%",
            end: "top 55%",
            scrub: 0.5,
          },
        },
      );

      gsap.fromTo(
        ".work-stage",
        { y: 70, scale: 0.96, opacity: 0.4 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".work-block",
            start: "top 90%",
            end: "top 45%",
            scrub: 0.55,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(".step-item").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 36, opacity: 0.12 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 58%",
              scrub: 0.45,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <section className="hero-block relative z-20 flex min-h-[calc(100svh-64px)] flex-col overflow-hidden">
        <HeroScene />
        <div className="hero-blob pointer-events-none absolute top-1/2 left-1/2 z-[1] h-[527px] w-[min(984px,92vw)] -translate-x-1/2 -translate-y-1/2 bg-[var(--hero-blob)] opacity-90 blur-[82px]" />
        <div
          className="hero-grid pointer-events-none absolute inset-0 z-[2] opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(26,152,251,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(26,152,251,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 70% 20%, #000 20%, transparent 75%)",
          }}
        />

        <div className="hero-stage wrap relative z-10 grid flex-1 items-center gap-10 py-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
          <div>
            <p className="rise inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              {hero.eyebrow}
            </p>
            <h1 className="rise-2 display mt-4 text-[clamp(40px,6.4vw,76px)] text-fg">
              {hero.headline.split("\n").slice(0, -1).join(" ")}
              <br />
              <span className="accent accent-wash">
                {hero.headline.split("\n").slice(-1)[0]}
              </span>
            </h1>
            <p className="rise-3 mt-5 max-w-[42ch] text-[16.5px] leading-relaxed text-fg/62">
              {hero.sub}
            </p>
            <div className="rise-4 relative z-30 mt-7 flex flex-wrap items-center gap-3">
              <Link href={hero.primaryHref} className="btn btn-beam">
                {hero.primaryCta}
              </Link>
              <Link href={hero.secondaryHref} className="btn btn-outline-light">
                {hero.secondaryCta}
              </Link>
            </div>
          </div>
          <OfferBoard />
        </div>

        <div className="relative z-10 border-t border-line">
          <div className="wrap grid grid-cols-2 md:grid-cols-4">
            {proof.map((item) => (
              <div
                key={item.label}
                className="border-b border-line px-0 py-4 even:pl-6 md:border-b-0 md:border-r md:px-6 md:even:pl-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <strong className="display block text-[22px] sm:text-[26px]">
                  {item.value}
                </strong>
                <span className="mt-1 block text-[12.5px] text-fg/60">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="scroll-cue pb-4 text-center font-mono text-[11px] tracking-[0.18em] text-fg/45 uppercase">
            Scroll — the offer is below
          </p>
        </div>
      </section>

      <Marquee items={stack} />

      <section ref={pin} className="relative z-0 hidden overflow-x-clip md:block">
        <div className="flex h-[calc(100svh-64px)] flex-col justify-center overflow-hidden">
          <div className="wrap mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
                Keep scrolling
              </p>
              <h2 className="display mt-2 text-[clamp(26px,3.6vw,42px)]">
                One line at a time.
              </h2>
            </div>
            <p className="font-mono text-[13px] text-fg/40">
              <span ref={indexEl}>01</span>
              <span className="text-fg/20"> / 06</span>
            </p>
          </div>
          <div ref={track} className="flex w-max items-center gap-6 px-6 will-change-transform md:px-16">
            {services.map((service, i) => (
              <Link
                key={service.id}
                href="/services"
                className="glass offer-card flex h-[min(420px,56vh)] w-[min(84vw,540px)] shrink-0 flex-col justify-between rounded-[28px] p-8 md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-beam/15 text-[22px]">
                    {["🌐","🛒","⚙️","🤖","⚡","👥","🔍","📣","📱","🔬","✦","🎬","📷","✍️","🖥️","🎓","🔒"][i] ?? "✦"}
                  </span>
                  <p className="font-mono text-[12px] text-cyan">{service.from}</p>
                </div>
                <div>
                  <h3 className="text-[clamp(28px,3.6vw,44px)] leading-[1.0] font-semibold tracking-[-0.045em]">
                    {service.title}
                  </h3>
                  <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-fg/60">
                    {service.summary}
                  </p>
                  <p className="mt-8 text-[12px] font-semibold tracking-[0.16em] text-cyan uppercase">
                    Open services →
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="wrap mt-8">
            <div className="offer-progress">
              <span ref={barEl} />
            </div>
            <div className="mt-3 flex justify-between text-[12px]">
              <span className="font-mono text-fg/30 uppercase">Unpack</span>
              <Link href="/services" className="font-semibold tracking-[0.08em] text-cyan uppercase">
                All services →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile vertical stack — replaces GSAP horizontal scroll on small screens */}
      <section className="border-t border-line py-12 md:hidden">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">What we do</p>
          <h2 className="display mt-2 text-[28px]">One line at a time.</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {services.map((service, i) => (
              <Link
                key={service.id}
                href="/services"
                className="glass flex flex-col gap-4 rounded-[20px] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-beam/15 text-[20px]">
                    {["🌐","🛒","⚙️","🤖","⚡","👥","🔍","📣","📱","🔬","✦","🎬","📷","✍️","🖥️","🎓","🔒"][i] ?? "✦"}
                  </span>
                  <span className="font-mono text-[11px] text-cyan">{service.from}</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold tracking-[-0.03em]">{service.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-fg/60">{service.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="desk-block border-t border-line py-20 md:py-24">
        <div className="wrap grid items-start gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
              Then try it
            </p>
            <h2 className="display mt-3 max-w-[12ch] text-[clamp(28px,4vw,48px)]">
              The enquiry desk.
            </h2>
            <p className="mt-4 max-w-[46ch] text-[15.5px] text-fg/55">
              This is the pattern we ship: answers first, then a human. Ask it
              about a website, an app, search, or motion.
            </p>
          </div>
          <StudioChat />
        </div>
      </section>

      <section className="work-block pb-20 md:pb-24">
        <div className="wrap">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
                Then the proof
              </p>
              <h2 className="display mt-2 text-[clamp(28px,4vw,48px)]">
                {featured.title}
              </h2>
            </div>
            <Link href="/work" className="btn btn-outline-light hidden sm:inline-flex">
              All work
            </Link>
          </div>
          <Link href={`/work/${featured.slug}`} className="work-stage group block">
            <div className="overflow-hidden rounded-[24px] border border-line">
              <div className="grid md:grid-cols-[1.15fr_0.85fr]">
                <div className="relative min-h-[280px] bg-[linear-gradient(160deg,#2c211b,#6b4a38_42%,#d7c4a8)] p-8 md:min-h-[340px] md:p-10">
                  <p className="font-mono text-[11px] tracking-[0.22em] text-white/55 uppercase">
                    {featured.status} · {featured.kind}
                  </p>
                  <p className="absolute bottom-8 left-8 font-serif text-[64px] leading-none text-[#f4efe6] italic md:bottom-10 md:left-10 md:text-[80px]">
                    Plot
                  </p>
                </div>
                <div className="flex flex-col justify-between bg-fg/[0.03] p-8 md:p-10">
                  <p className="text-[16.5px] leading-relaxed text-fg/68">
                    {featured.summary}
                  </p>
                  <p className="mt-8 text-[12px] font-semibold tracking-[0.16em] text-cyan uppercase group-hover:text-fg">
                    Open the case →
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="ship-block border-y border-line py-20 md:py-24">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            How it ships
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-4 md:gap-0">
            {process.map((step, i) => (
              <div
                key={step.n}
                className={`step-item md:pr-8 ${
                  i < process.length - 1 ? "md:border-r md:border-line" : ""
                } ${i > 0 ? "md:pl-8" : ""}`}
              >
                <p className="font-mono text-[12px] text-tech">{step.n}</p>
                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.03em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-fg/65">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
              First questions
            </p>
            <h2 className="display mt-3 text-[clamp(28px,3.6vw,44px)]">
              Price, time, lock-in.
            </h2>
          </div>
          <Faq />
        </div>
      </section>
    </div>
  );
}
