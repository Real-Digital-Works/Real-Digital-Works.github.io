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
import { CmsLink } from "@/components/visual-editor/CmsLink";
import {
  CmsText,
  useDraftArray,
  useDraftServicesHome,
  useLiveDraft,
} from "@/components/visual-editor/CmsText";
import { useVisualEditorOptional } from "@/components/visual-editor/VisualEditorProvider";
import {
  DEFAULT_HOME_SECTIONS,
  process as seedProcess,
  projectMetaLine,
  projects,
  proof as seedProof,
  stack,
  hero,
  visibleItems,
  type ProcessStep,
  type Project,
  type ProofStat,
  type Service,
} from "@/lib/content";
import { homeServices as seedHomeServices } from "@/lib/services-data";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomeView() {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const indexEl = useRef<HTMLSpanElement>(null);
  const barEl = useRef<HTMLSpanElement>(null);
  const visualOn = Boolean(useVisualEditorOptional()?.enabled);
  const draft = useLiveDraft();
  const home = { ...DEFAULT_HOME_SECTIONS, ...(draft.homeSections ?? {}) };
  const proof = useDraftArray<ProofStat>("proof", seedProof);
  const process = useDraftArray<ProcessStep>("process", seedProcess);
  const homeServices = useDraftServicesHome<Service>(seedHomeServices);
  const liveProjects = useDraftArray<Project>("projects", projects);
  const featuredProjects = visibleItems(liveProjects).slice(0, 5);
  const featured = featuredProjects[0];

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || visualOn) return;

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
    { scope: root, dependencies: [visualOn] },
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
              <CmsText path="hero.eyebrow">{hero.eyebrow}</CmsText>
            </p>
            <CmsText
              path="hero.headline"
              as="h1"
              className="rise-2 display mt-4 text-[clamp(40px,6.4vw,76px)] text-fg"
              accentLastLine
            >
              {hero.headline}
            </CmsText>
            <CmsText
              path="hero.sub"
              as="p"
              className="rise-3 mt-5 max-w-[42ch] text-[16.5px] leading-relaxed text-fg/62"
              html
            >
              {hero.sub}
            </CmsText>
            <div className="rise-4 relative z-30 mt-7 flex flex-wrap items-center gap-3">
              <CmsLink ctaId="hero.primary" href={hero.primaryHref} className="btn btn-beam">
                {hero.primaryCta}
              </CmsLink>
              <CmsLink ctaId="hero.secondary" href={hero.secondaryHref} className="btn btn-outline-light">
                {hero.secondaryCta}
              </CmsLink>
            </div>
          </div>
          <OfferBoard />
        </div>

        <div className="relative z-10 border-t border-line">
          <div className="wrap grid grid-cols-2 md:grid-cols-4">
            {proof.map((item, i) => (
              <div
                key={item.label}
                className="border-b border-line px-0 py-4 even:pl-6 md:border-b-0 md:border-r md:px-6 md:even:pl-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <strong className="display block text-[22px] sm:text-[26px]">
                  <CmsText path={`proof.${i}.value`}>{item.value}</CmsText>
                </strong>
                <span className="mt-1 block text-[12.5px] text-fg/60">
                  <CmsText path={`proof.${i}.label`}>{item.label}</CmsText>
                </span>
              </div>
            ))}
          </div>
          <p className="scroll-cue pb-4 text-center font-mono text-[11px] tracking-[0.18em] text-fg/45 uppercase">
            <CmsText path="homeSections.scrollCue">{home.scrollCue}</CmsText>
          </p>
        </div>
      </section>

      <Marquee items={stack} />

      <section ref={pin} className={`relative z-0 overflow-x-clip ${homeServices.length > 0 ? "hidden md:block" : "hidden"}`}>
        <div className="flex h-[calc(100svh-64px)] flex-col justify-center overflow-hidden">
          <div className="wrap mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
                <CmsText path="homeSections.offerEyebrow">{home.offerEyebrow}</CmsText>
              </p>
              <h2 className="display mt-2 text-[clamp(26px,3.6vw,42px)]">
                <CmsText path="homeSections.offerTitle">{home.offerTitle}</CmsText>
              </h2>
            </div>
            <p className="font-mono text-[13px] text-fg/40">
              <span ref={indexEl}>01</span>
              <span className="text-fg/20"> / {String(homeServices.length).padStart(2, "0")}</span>
            </p>
          </div>
          <div ref={track} className="flex w-max items-center gap-6 px-6 will-change-transform md:px-16">
            {homeServices.map((service, i) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="glass offer-card flex h-[min(420px,56vh)] w-[min(84vw,540px)] shrink-0 flex-col justify-between rounded-[28px] p-8 md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-beam/15 text-[22px]">
                    {["🌐","🛒","⚙️","🤖","⚡","👥","🔍","📣","📱","🔬","✦","🎬","📷","✍️","🖥️","🎓","🔒"][i] ?? "✦"}
                  </span>
                  <p className="font-mono text-[12px] text-cyan">
                    <CmsText path={`svc.${service.id}.from`}>{service.from}</CmsText>
                  </p>
                </div>
                <div>
                  <h3 className="text-[clamp(28px,3.6vw,44px)] leading-[1.0] font-semibold tracking-[-0.045em]">
                    <CmsText path={`svc.${service.id}.listingTitle`}>{service.title}</CmsText>
                  </h3>
                  <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-fg/60">
                    <CmsText path={`svc.${service.id}.summary`}>{service.summary}</CmsText>
                  </p>
                  <p className="mt-8 text-[12px] font-semibold tracking-[0.16em] text-cyan uppercase">
                    <CmsText path="homeSections.offerOpen">{home.offerOpen}</CmsText>
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
              <span className="font-mono text-fg/30 uppercase">
                <CmsText path="homeSections.unpack">{home.unpack}</CmsText>
              </span>
              <CmsLink ctaId="home.allServices" href="/services" className="font-semibold tracking-[0.08em] text-cyan uppercase">
                All services →
              </CmsLink>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile vertical stack — replaces GSAP horizontal scroll on small screens */}
      <section className={`border-t border-line py-12 ${homeServices.length > 0 ? "md:hidden" : "hidden"}`}>
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            <CmsText path="homeSections.offerMobileEyebrow">{home.offerMobileEyebrow}</CmsText>
          </p>
          <h2 className="display mt-2 text-[28px]">
            <CmsText path="homeSections.offerTitle">{home.offerTitle}</CmsText>
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {homeServices.map((service, i) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="glass flex flex-col gap-4 rounded-[20px] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-beam/15 text-[20px]">
                    {["🌐","🛒","⚙️","🤖","⚡","👥","🔍","📣","📱","🔬","✦","🎬","📷","✍️","🖥️","🎓","🔒"][i] ?? "✦"}
                  </span>
                  <span className="font-mono text-[11px] text-cyan">
                    <CmsText path={`svc.${service.id}.from`}>{service.from}</CmsText>
                  </span>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold tracking-[-0.03em]">
                    <CmsText path={`svc.${service.id}.listingTitle`}>{service.title}</CmsText>
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-fg/60">
                    <CmsText path={`svc.${service.id}.summary`}>{service.summary}</CmsText>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="desk-block relative z-10 border-t border-line py-20 md:py-24">
        <div className="wrap grid items-start gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
              <CmsText path="homeSections.deskEyebrow">{home.deskEyebrow}</CmsText>
            </p>
            <CmsText
              path="homeSections.deskTitle"
              as="h2"
              className="display mt-3 max-w-[12ch] text-[clamp(28px,4vw,48px)]"
            >
              {home.deskTitle}
            </CmsText>
            <CmsText
              path="homeSections.deskIntro"
              as="p"
              className="mt-4 max-w-[46ch] text-[15.5px] text-fg/55"
            >
              {home.deskIntro}
            </CmsText>
          </div>
          <StudioChat />
        </div>
      </section>

      {featuredProjects.length > 0 && (
      <section className="work-block relative z-10 pb-20 md:pb-24">
        <div className="wrap">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
                <CmsText path="homeSections.workEyebrow">{home.workEyebrow}</CmsText>
              </p>
              <CmsText
                path="homeSections.workTitle"
                as="h2"
                className="display mt-2 text-[clamp(28px,4vw,48px)]"
              >
                {home.workTitle}
              </CmsText>
            </div>
            <CmsLink ctaId="home.allWork" href="/work" className="btn btn-outline-light hidden sm:inline-flex">
              All work
            </CmsLink>
          </div>
          <div className="work-stage grid gap-3 md:grid-cols-2">
            {featured && (
              <Link
                href={`/work/${featured.slug}`}
                className="glass group overflow-hidden rounded-[24px] md:col-span-2"
              >
                <div className="grid md:grid-cols-[1.2fr_0.8fr]">
                  <div
                    className="min-h-[220px] bg-cover bg-center md:min-h-[340px]"
                    style={
                      featured.image
                        ? {
                            backgroundImage: `url(${featured.image})`,
                          }
                        : {
                            background: `linear-gradient(160deg, ${featured.accent}, #1a2230 78%)`,
                          }
                    }
                  />
                  <div className="flex flex-col justify-between p-8 md:p-10">
                    <div>
                      <p className="font-mono text-[11px] tracking-[0.16em] text-cyan uppercase">
                        {projectMetaLine(featured)}
                      </p>
                      <h3 className="mt-3 text-[clamp(26px,3vw,40px)] font-semibold tracking-[-0.04em] group-hover:text-tech">
                        <CmsText path={`project.${featured.slug}.title`}>{featured.title}</CmsText>
                      </h3>
                      <p className="mt-3 max-w-[42ch] text-[16px] leading-relaxed text-fg/68">
                        <CmsText path={`project.${featured.slug}.summary`}>{featured.summary}</CmsText>
                      </p>
                    </div>
                    <p className="mt-8 text-[12px] font-semibold tracking-[0.16em] text-cyan uppercase group-hover:text-fg">
                      <CmsText path="homeSections.openCase">{home.openCase}</CmsText>
                    </p>
                  </div>
                </div>
              </Link>
            )}
            {featuredProjects.slice(1).map((project) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="glass group flex flex-col overflow-hidden rounded-[22px]"
              >
                <div
                  className="min-h-[160px] bg-cover bg-center"
                  style={
                    project.image
                      ? { backgroundImage: `url(${project.image})` }
                      : {
                          background: `linear-gradient(145deg, ${project.accent}, #1a2230 78%)`,
                        }
                  }
                />
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <p className="font-mono text-[11px] tracking-[0.16em] text-cyan uppercase">
                    {projectMetaLine(project)}
                  </p>
                  <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] group-hover:text-tech">
                    <CmsText path={`project.${project.slug}.title`}>{project.title}</CmsText>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-fg/55">
                    <CmsText path={`project.${project.slug}.summary`}>{project.summary}</CmsText>
                  </p>
                  <p className="mt-auto pt-5 text-[11px] font-semibold tracking-[0.16em] text-cyan uppercase group-hover:text-fg">
                    <CmsText path="homeSections.openCase">{home.openCase}</CmsText>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="ship-block border-y border-line py-20 md:py-24">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            <CmsText path="homeSections.processEyebrow">{home.processEyebrow}</CmsText>
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
                  <CmsText path={`process.${i}.title`}>{step.title}</CmsText>
                </h3>
                <CmsText
                  path={`process.${i}.body`}
                  as="p"
                  className="mt-2 text-[14.5px] leading-relaxed text-fg/65"
                  html
                >
                  {step.body}
                </CmsText>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
              <CmsText path="homeSections.faqEyebrow">{home.faqEyebrow}</CmsText>
            </p>
            <CmsText
              path="homeSections.faqTitle"
              as="h2"
              className="display mt-3 text-[clamp(28px,3.6vw,44px)]"
            >
              {home.faqTitle}
            </CmsText>
          </div>
          <Faq />
        </div>
      </section>
    </div>
  );
}
