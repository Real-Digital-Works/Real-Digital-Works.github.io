// Individual service page data for /services/[slug]
// Each entry maps to one URL and one generated static page.
// Team: fill in `intro`, `whatsIncluded`, and `faq` copy where marked TODO.

export type ServiceEntry = {
  slug: string;
  category: "Build" | "Grow" | "Create" | "Support";
  title: string;
  from: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  whatsIncluded: { title: string; description: string }[];
  faq: { q: string; a: string }[];
  relatedSlugs: string[];
};

export const servicePages: ServiceEntry[] = [
  // ───── BUILD ─────
  {
    slug: "web-design",
    category: "Build",
    title: "Web design",
    from: "From £1,450",
    seoTitle: "Web Design London | Real Digital Works",
    seoDescription:
      "Professional web design for London businesses. Brochure sites, booking sites and shops — designed and built in-house from our Kennington studio.",
    intro:
      "A website is your loudest salesperson. We design sites that look expensive, load fast, and turn visitors into enquiries. Every project includes a live review loop until you're happy.",
    whatsIncluded: [
      { title: "Discovery & strategy", description: "We map your users, competitors, and goals before touching Figma." },
      { title: "UI/UX design", description: "Desktop and mobile designs with real copy, not Lorem Ipsum." },
      { title: "Build & CMS", description: "Clean code you can maintain. No page-builder lock-in." },
      { title: "Forms & analytics", description: "Contact forms, booking flows, and Google Analytics 4 from day one." },
      { title: "Accessibility pass", description: "WCAG 2.2 AA compliant as standard." },
      { title: "30 days post-launch", description: "Bug fixes and small changes included after go-live." },
    ],
    faq: [
      { q: "How long does a website take?", a: "A brochure site is typically 4–6 weeks from sign-off to launch. Shops and custom builds take 8–16 weeks depending on scope." },
      { q: "Do you use templates?", a: "No. Every design starts from scratch. We don't use Squarespace, Wix, or off-the-shelf themes." },
      { q: "Can I update it myself?", a: "Yes. We build with a headless CMS so your team can edit copy, images, and pages without touching code." },
      { q: "What is included in the price?", a: "Design, build, CMS setup, forms, basic SEO setup, and 30 days of post-launch support. Hosting is quoted separately." },
    ],
    relatedSlugs: ["ecommerce", "seo", "branding", "hosting"],
  },
  {
    slug: "ecommerce",
    category: "Build",
    title: "Ecommerce",
    from: "From £2,800",
    seoTitle: "Ecommerce Website Design London | Real Digital Works",
    seoDescription:
      "Ecommerce sites built for growth. Shopify, WooCommerce, or custom — designed to convert from our London studio.",
    intro:
      "Selling online should be simple for you and frictionless for your customers. We build shops that convert, with inventory management your team can actually use.",
    whatsIncluded: [
      { title: "Platform selection", description: "We recommend the right platform — Shopify, WooCommerce, or custom — based on your catalogue size and team." },
      { title: "Product catalogue setup", description: "We migrate or build your products, collections, and variants." },
      { title: "Checkout optimisation", description: "Minimal steps, guest checkout, and trusted payment badges." },
      { title: "Payment & shipping", description: "Stripe, PayPal, Klarna, and major couriers connected." },
      { title: "Email flows", description: "Abandoned cart, order confirmation, and review requests." },
      { title: "Analytics & conversion tracking", description: "Google Analytics 4 + Meta Pixel from day one." },
    ],
    faq: [
      { q: "Which platform do you recommend?", a: "It depends on your catalogue and team. Shopify is fastest to launch; WooCommerce suits WordPress sites; custom is best for unique workflows." },
      { q: "Can you migrate my existing shop?", a: "Yes. We handle product, order, and customer migrations from most platforms." },
      { q: "Do you design the checkout?", a: "Yes. We design and optimise the full purchase flow including basket, checkout, and confirmation." },
    ],
    relatedSlugs: ["web-design", "seo", "google-ads", "hosting"],
  },
  {
    slug: "web-applications",
    category: "Build",
    title: "Web applications",
    from: "Scoped",
    seoTitle: "Custom Web Application Development London | Real Digital Works",
    seoDescription:
      "Bespoke web apps, client portals, dashboards, and internal tools built and owned by you. Fixed scope, weekly releases from our London team.",
    intro:
      "The thing that is not a template: client portals, internal tools, booking engines, training ops, dashboards. Cloud-native, owned by you. We write a fixed scope first so you know exactly what you're getting.",
    whatsIncluded: [
      { title: "Discovery & scoping", description: "A written specification before any code is committed." },
      { title: "Weekly release slices", description: "Working software in your hands every week, not at the end." },
      { title: "Cloud-native architecture", description: "Scales from day one. AWS, GCP, or Azure — your choice." },
      { title: "Authentication & permissions", description: "Roles, teams, SSO, and audit logs." },
      { title: "API integrations", description: "Connect to CRMs, accounting software, and third-party services." },
      { title: "Handover & documentation", description: "Full source code, docs, and knowledge transfer. You own it." },
    ],
    faq: [
      { q: "How is the project priced?", a: "We scope first (usually £950–£1,500) and then quote a fixed build price. No hourly billing." },
      { q: "Do we own the code?", a: "Yes. Full source code transfer on completion." },
      { q: "What stack do you use?", a: "Next.js, TypeScript, PostgreSQL, and cloud-native services. We can adapt to your existing stack if needed." },
    ],
    relatedSlugs: ["ai-automation", "hosting", "web-design", "training"],
  },
  {
    slug: "landing-pages",
    category: "Build",
    title: "Landing pages",
    from: "From £650",
    seoTitle: "Landing Page Design London | Real Digital Works",
    seoDescription:
      "High-converting landing pages for Google Ads, social campaigns, and product launches. Designed and live in days, not weeks.",
    intro:
      "A single page that does one job: convert. We design landing pages built around your campaign goal, your ad copy, and your audience — then A/B test until the numbers move.",
    whatsIncluded: [
      { title: "Goal-first design", description: "Every element exists to support one action." },
      { title: "Copy alignment", description: "We match your ad copy to your landing page headline." },
      { title: "Mobile-first build", description: "Most ad traffic is mobile. We design there first." },
      { title: "Fast load", description: "Sub-2s load time as standard. Speed kills bounce rate." },
      { title: "A/B testing setup", description: "Optional variant testing with clear reporting." },
      { title: "Analytics & conversion events", description: "Google Ads and Meta conversions wired up at launch." },
    ],
    faq: [
      { q: "How quickly can you deliver?", a: "Standard landing pages in 5–7 working days." },
      { q: "Can you write the copy?", a: "Yes. Copywriting is available as an add-on." },
      { q: "Do you connect it to my Google Ads account?", a: "Yes. We set up conversion tracking and connect your destination URLs." },
    ],
    relatedSlugs: ["web-design", "google-ads", "seo", "copywriting"],
  },

  // ───── GROW ─────
  {
    slug: "seo",
    category: "Grow",
    title: "SEO",
    from: "From £550 / month",
    seoTitle: "SEO Agency London | Real Digital Works",
    seoDescription:
      "Local and national SEO for London businesses. Technical fixes, content that ranks, and transparent monthly reporting from Kennington.",
    intro:
      "Get found by people already looking. Most sites fail search because the foundations were never set — we fix that first, then build content that earns rankings and holds them.",
    whatsIncluded: [
      { title: "Technical SEO audit", description: "Core Web Vitals, crawlability, schema, and canonical fixes." },
      { title: "Local SEO", description: "Google Business Profile optimisation and local citation building." },
      { title: "Keyword strategy", description: "Real search demand mapped to pages you already have or can build." },
      { title: "Content production", description: "Pages and posts written for humans and optimised for search." },
      { title: "Link building", description: "Earned links from relevant UK publishers, not link farms." },
      { title: "Monthly reporting", description: "Plain-English report: rankings, traffic, and leads." },
    ],
    faq: [
      { q: "How long before I see results?", a: "Technical fixes take effect in 4–8 weeks. Content and link building typically moves rankings in 3–6 months." },
      { q: "Is there a minimum contract?", a: "We ask for 6 months to show meaningful results. Most clients stay long-term." },
      { q: "Do you guarantee rankings?", a: "No one can guarantee positions. We guarantee the work, the reporting, and that we won't use methods that get sites penalised." },
    ],
    relatedSlugs: ["google-ads", "web-design", "copywriting", "social-media"],
  },
  {
    slug: "google-ads",
    category: "Grow",
    title: "Google Ads",
    from: "From £450 / month",
    seoTitle: "Google Ads Management London | Real Digital Works",
    seoDescription:
      "Google Ads management for London businesses. Search, Performance Max, and Shopping campaigns managed for ROI, not impressions.",
    intro:
      "Paid search done properly: the right keywords, tight negative lists, and landing pages that convert. We manage your budget like it's ours.",
    whatsIncluded: [
      { title: "Account audit or setup", description: "We review or build your account from scratch with the right structure." },
      { title: "Keyword & audience research", description: "Profitable terms, negative lists, and competitor analysis." },
      { title: "Ad copywriting", description: "RSAs and assets written to your brand voice and tested weekly." },
      { title: "Conversion tracking", description: "GA4, Google Ads tags, and call tracking configured correctly." },
      { title: "Bid strategy management", description: "Smart bidding with human oversight — not set and forget." },
      { title: "Monthly reporting", description: "Cost per lead, ROAS, and what we plan to do next month." },
    ],
    faq: [
      { q: "What is your management fee?", a: "From £450/month. The fee covers management only; ad spend is paid directly to Google." },
      { q: "Do you manage Shopping campaigns?", a: "Yes. We manage Search, Shopping, Display, and Performance Max." },
      { q: "Can you take over an existing account?", a: "Yes. We audit before making changes so nothing breaks during the handover." },
    ],
    relatedSlugs: ["seo", "landing-pages", "social-media", "web-design"],
  },
  {
    slug: "social-media",
    category: "Grow",
    title: "Social media",
    from: "From £395 / month",
    seoTitle: "Social Media Management London | Real Digital Works",
    seoDescription:
      "Social media management for London businesses. Content, scheduling, and paid social from our Kennington studio.",
    intro:
      "Consistent, on-brand content that builds an audience worth having. We plan, create, schedule, and report — you stay focused on running your business.",
    whatsIncluded: [
      { title: "Content calendar", description: "Monthly plan approved before publishing." },
      { title: "Graphic & copy production", description: "Static posts, Reels scripts, and carousel design." },
      { title: "Scheduling & publishing", description: "Posted at the right times on the right platforms." },
      { title: "Community management", description: "Comment replies and DM management during business hours." },
      { title: "Paid social", description: "Meta Ads and LinkedIn Ads available as an add-on." },
      { title: "Monthly reporting", description: "Reach, engagement, follower growth, and link clicks." },
    ],
    faq: [
      { q: "Which platforms do you manage?", a: "Instagram, Facebook, LinkedIn, TikTok, and X. We recommend focusing on 2–3 that suit your audience." },
      { q: "Do you create video content?", a: "Yes. Reels, short-form video, and animations are available at additional cost." },
      { q: "Can I approve content before it goes live?", a: "Always. Every post goes through approval before publishing." },
    ],
    relatedSlugs: ["google-ads", "seo", "branding", "copywriting"],
  },
  {
    slug: "email-marketing",
    category: "Grow",
    title: "Email marketing",
    from: "From £295 / month",
    seoTitle: "Email Marketing Agency London | Real Digital Works",
    seoDescription:
      "Email marketing strategy, design, and automation for London businesses. Newsletters, drip campaigns, and flows with Mailchimp, Klaviyo, or your platform.",
    intro:
      "Email still delivers the highest ROI of any channel. We build lists that grow, write campaigns people open, and set up automations that work while you sleep.",
    whatsIncluded: [
      { title: "Platform setup or audit", description: "Mailchimp, Klaviyo, Campaign Monitor — properly configured." },
      { title: "List growth strategy", description: "Sign-up forms, lead magnets, and segmentation." },
      { title: "Campaign design & copy", description: "On-brand templates written to convert, not just inform." },
      { title: "Automations", description: "Welcome series, abandoned cart, re-engagement, and post-purchase flows." },
      { title: "A/B testing", description: "Subject lines, send times, and CTAs tested and reported monthly." },
      { title: "Monthly reporting", description: "Open rate, click rate, revenue attributed, and list health." },
    ],
    faq: [
      { q: "Which platform do you recommend?", a: "Klaviyo for ecommerce; Mailchimp for most service businesses. We work with any platform." },
      { q: "Do you write the emails?", a: "Yes. Copywriting is included in the monthly fee." },
      { q: "Can you set up my automations?", a: "Yes. Automation setup is included from the Standard plan upwards." },
    ],
    relatedSlugs: ["social-media", "seo", "web-design", "copywriting"],
  },

  // ───── CREATE ─────
  {
    slug: "branding",
    category: "Create",
    title: "Branding",
    from: "From £1,100",
    seoTitle: "Brand Design Agency London | Real Digital Works",
    seoDescription:
      "Brand identity design for London businesses. Logo, colour, typography, tone, and usage guidelines — so every touchpoint looks like you.",
    intro:
      "A brand is more than a logo. It's a consistent set of decisions that tells your audience who you are before you say a word. We build brand systems that hold up at any size.",
    whatsIncluded: [
      { title: "Brand discovery", description: "Your values, audience, and competitors mapped to visual direction." },
      { title: "Logo design", description: "Primary, secondary, and icon variants. Vector files in all formats." },
      { title: "Colour & typography", description: "A palette and type system that works across screen and print." },
      { title: "Tone of voice", description: "A short guide so everyone who writes for the brand sounds consistent." },
      { title: "Brand guidelines PDF", description: "One document with everything your suppliers need." },
      { title: "Asset pack", description: "Social profile assets, email signature, and document templates." },
    ],
    faq: [
      { q: "Do you do rebrands?", a: "Yes. Most of our branding work is refreshing an existing identity, not starting from zero." },
      { q: "What file formats do we receive?", a: "SVG, EPS, PDF, PNG (transparent), and Figma source file." },
      { q: "Can you design branded templates for our team?", a: "Yes. Canva, Google Slides, and Word templates are available as add-ons." },
    ],
    relatedSlugs: ["web-design", "copywriting", "photography", "social-media"],
  },
  {
    slug: "3d-animation",
    category: "Create",
    title: "3D & animation",
    from: "From £450",
    seoTitle: "3D Animation & Motion Design London | Real Digital Works",
    seoDescription:
      "3D renders, product animations, explainer videos, and motion graphics produced in-house by the Real Animation Works studio in London.",
    intro:
      "Product renders, explainers, and motion produced in-house by a studio that has taught this craft for over a decade. Maya, 3ds Max, Unreal, Blender, After Effects — used daily.",
    whatsIncluded: [
      { title: "Concept & storyboard", description: "Shot list and animatic approved before render time is spent." },
      { title: "3D modelling & texturing", description: "Photo-real or stylised assets to your brief." },
      { title: "Lighting & rendering", description: "Studio, product, or environment renders at broadcast quality." },
      { title: "Animation & rigging", description: "Character, product, and architectural walkthroughs." },
      { title: "Motion graphics", description: "Title cards, lower thirds, and infographic animations in After Effects." },
      { title: "Final delivery", description: "MP4, MOV, and web-optimised versions. Source files available." },
    ],
    faq: [
      { q: "What software do you use?", a: "Maya, 3ds Max, Blender, Unreal Engine, and After Effects — depending on the project." },
      { q: "Can you animate our product?", a: "Yes. Product animation is one of our most common briefs. Send us your CAD or reference images." },
      { q: "Do you do VFX for video?", a: "Yes. We composite 3D elements into live footage using After Effects and Nuke." },
    ],
    relatedSlugs: ["photography", "branding", "web-design", "copywriting"],
  },
  {
    slug: "photography",
    category: "Create",
    title: "Photography",
    from: "From £350",
    seoTitle: "Commercial Photography London | Real Digital Works",
    seoDescription:
      "Commercial photography for London businesses. Product, lifestyle, headshot, and event photography from our Kennington studio or on location.",
    intro:
      "Stock photos look like stock photos. We shoot original images that match your brand — product flat lays, team headshots, office spaces, and on-location lifestyle photography.",
    whatsIncluded: [
      { title: "Pre-shoot brief", description: "Shot list, mood board, and location agreed before the day." },
      { title: "Professional photography", description: "Shoot in our Kennington studio or on location in London." },
      { title: "Editing & retouching", description: "Colour grading, background removal, and skin retouching as required." },
      { title: "Web & print delivery", description: "High-res TIFFs and web-optimised JPEGs in your brand palette." },
      { title: "Usage licence", description: "Full commercial usage rights. No hidden re-licensing fees." },
    ],
    faq: [
      { q: "Do you shoot on location?", a: "Yes. We cover London and the South East. Travel costs apply outside the M25." },
      { q: "How many images do we receive?", a: "Minimum 30 edited selects per half-day shoot." },
      { q: "Can you shoot our products for Amazon?", a: "Yes. We produce white-background and lifestyle product images to Amazon's technical spec." },
    ],
    relatedSlugs: ["branding", "3d-animation", "web-design", "social-media"],
  },
  {
    slug: "copywriting",
    category: "Create",
    title: "Copywriting",
    from: "From £195",
    seoTitle: "Copywriting Agency London | Real Digital Works",
    seoDescription:
      "Web copy, blog posts, case studies, and ads written for London businesses. Clear, on-brand writing that ranks and converts.",
    intro:
      "Words do the selling. We write web copy, blog posts, case studies, and ad copy that sounds like your brand — not a template — and earns the action you're asking for.",
    whatsIncluded: [
      { title: "Brand voice audit", description: "We read what you already publish before writing a word." },
      { title: "Keyword research", description: "Every page written around real search terms people use." },
      { title: "Web page copy", description: "Homepage, service pages, about, and contact — from scratch or refresh." },
      { title: "Blog posts & articles", description: "Researched, SEO-optimised, and genuinely useful to your audience." },
      { title: "Case studies", description: "Client success stories structured for sales and search." },
      { title: "Revisions included", description: "Two rounds of amends on every piece." },
    ],
    faq: [
      { q: "Do you research topics or do we provide briefs?", a: "Either works. We can research and pitch topics or write to your briefs." },
      { q: "Is the copy SEO optimised?", a: "Yes. We write for humans first, but every piece is optimised for a primary keyword." },
      { q: "Do you write long-form content?", a: "Yes. Pillar pages, white papers, and guides from 1,000 to 5,000+ words." },
    ],
    relatedSlugs: ["seo", "web-design", "branding", "email-marketing"],
  },

  // ───── SUPPORT ─────
  {
    slug: "hosting",
    category: "Support",
    title: "Hosting & care",
    from: "From £95 / month",
    seoTitle: "Managed Website Hosting London | Real Digital Works",
    seoDescription:
      "Managed website hosting, updates, backups, and support from our London team. Your site stays fast, secure, and up to date.",
    intro:
      "You are not left with a login and a prayer. Every build includes 30 days post-launch support. After that, stay on a care plan or take the keys — you own the source either way.",
    whatsIncluded: [
      { title: "Managed hosting", description: "UK-based servers with 99.9% uptime SLA." },
      { title: "Daily backups", description: "30-day rolling backups with one-click restore." },
      { title: "CMS & plugin updates", description: "Core, plugin, and dependency updates tested and applied monthly." },
      { title: "Security monitoring", description: "Malware scanning, firewall, and SSL certificate management." },
      { title: "Performance monitoring", description: "Uptime alerts and Core Web Vitals tracked monthly." },
      { title: "1 hour of changes", description: "Copy edits, image swaps, and minor layout changes each month." },
    ],
    faq: [
      { q: "Do I have to use your hosting?", a: "No. You can host anywhere. The care plan support is still available." },
      { q: "What happens if my site goes down?", a: "We get an alert and respond within 2 hours during business hours." },
      { q: "Can I cancel the care plan?", a: "Yes, with 30 days' notice. You keep your site and all files." },
    ],
    relatedSlugs: ["web-design", "ecommerce", "web-applications", "training"],
  },
  {
    slug: "training",
    category: "Support",
    title: "Training",
    from: "From £250",
    seoTitle: "Digital Skills Training London | Real Digital Works",
    seoDescription:
      "Digital training for teams in London. CMS, Google Ads, analytics, social media, and AI tools taught by the people who build them.",
    intro:
      "Stop paying for things your team could do in-house. We train your people on the tools we use daily — CMS editing, Google Ads, analytics, social media, and AI workflows — so you build capability, not dependency.",
    whatsIncluded: [
      { title: "Needs assessment", description: "We map your team's current skills and the gaps we need to close." },
      { title: "Custom curriculum", description: "Training built around your tools and your real scenarios." },
      { title: "Hands-on sessions", description: "Live workshop in your office or via video — no slide-deck lectures." },
      { title: "Session recordings", description: "Every session recorded for your team to rewatch." },
      { title: "Reference guides", description: "Written step-by-step guides for your specific setup." },
      { title: "Follow-up Q&A", description: "30-day email support after training so questions get answered." },
    ],
    faq: [
      { q: "Can you train our whole team?", a: "Yes. Group sessions for up to 12 people, or 1-2-1 for specialists." },
      { q: "Do you offer ongoing training programmes?", a: "Yes. Monthly retainer training programmes are available for fast-moving teams." },
      { q: "Can training be delivered remotely?", a: "Yes. All training is available remotely or in-person at your office or ours." },
    ],
    relatedSlugs: ["ai-automation", "hosting", "web-applications", "web-design"],
  },
  {
    slug: "ai-automation",
    category: "Support",
    title: "AI & automation",
    from: "From £900",
    seoTitle: "AI Automation Agency London | Real Digital Works",
    seoDescription:
      "AI and business automation for London businesses. Chat tools, follow-up flows, and admin systems that save hours — practical, not theatre.",
    intro:
      "Enquiry chats that book into a diary, follow-ups that actually send, admin that stops living in someone's head. We start with one workflow that saves hours. If it works, we add the next.",
    whatsIncluded: [
      { title: "Workflow audit", description: "We map your most time-expensive manual processes first." },
      { title: "AI chat deployment", description: "Trained on your service info, pricing, and FAQs. Books and qualifies." },
      { title: "CRM & calendar integration", description: "Connected to your existing tools — HubSpot, Calendly, and more." },
      { title: "Automated follow-ups", description: "Enquiry acknowledgements, quote reminders, and review requests." },
      { title: "Internal automations", description: "Invoice creation, job sheets, and reporting without manual entry." },
      { title: "Monitoring & iteration", description: "We review usage data monthly and improve flows that underperform." },
    ],
    faq: [
      { q: "Do I need a big tech budget?", a: "No. Most workflows use off-the-shelf AI tools (OpenAI, Make, Zapier) under £100/month in running costs." },
      { q: "How do you start?", a: "We always start with a single workflow — the one that wastes the most time. Once it works, we build from there." },
      { q: "What if the AI says something wrong to a customer?", a: "We build in human handover rules for anything sensitive, and you approve all AI responses before it goes live." },
    ],
    relatedSlugs: ["web-applications", "training", "web-design", "hosting"],
  },
  {
    slug: "consultancy",
    category: "Support",
    title: "Consultancy",
    from: "From £195 / hour",
    seoTitle: "Digital Consultancy London | Real Digital Works",
    seoDescription:
      "Independent digital consultancy for London businesses. Strategy, audits, technology decisions, and agency reviews from an experienced team.",
    intro:
      "Sometimes you need a second opinion from someone who has built things, not just advised on them. We review your digital setup, strategy, and supplier relationships without selling you a project.",
    whatsIncluded: [
      { title: "Digital audit", description: "Website, SEO, ads, social, email, and tech stack reviewed and rated." },
      { title: "Supplier review", description: "We review what your current agency or freelancers are delivering." },
      { title: "Strategy workshop", description: "Half or full-day session to set 12-month digital direction." },
      { title: "Technology guidance", description: "Platform selection, migration planning, and stack decisions." },
      { title: "Written report", description: "Prioritised findings with recommended next steps." },
      { title: "Ongoing advisory", description: "Monthly retainer advisory available for teams that need a sounding board." },
    ],
    faq: [
      { q: "Are you independent?", a: "Yes. Consultancy engagements are billed at a fixed hourly or day rate. We don't earn commission on referrals." },
      { q: "Can you review our current agency?", a: "Yes. We do supplier audits and can sit alongside your existing team or help you transition." },
      { q: "Do you offer board-level digital advisory?", a: "Yes. Monthly retained advisory at director level is available." },
    ],
    relatedSlugs: ["ai-automation", "seo", "google-ads", "web-design"],
  },
];

// Category groupings for menus and footers
export const serviceCategories = [
  { label: "Build", slugs: ["web-design", "ecommerce", "web-applications", "landing-pages"] },
  { label: "Grow", slugs: ["seo", "google-ads", "social-media", "email-marketing"] },
  { label: "Create", slugs: ["branding", "3d-animation", "photography", "copywriting"] },
  { label: "Support", slugs: ["hosting", "training", "ai-automation", "consultancy"] },
] as const;

export function getServiceBySlug(slug: string): ServiceEntry | undefined {
  return servicePages.find((s) => s.slug === slug);
}
