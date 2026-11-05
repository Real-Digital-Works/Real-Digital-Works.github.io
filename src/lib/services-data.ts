// Individual service page data for /services/[slug]
// Copy sourced from Ali’s developer implementation pack (2 Nov 2026),
// mapped onto existing live slugs. Boilerplate card/FAQ lines were rewritten
// so each page stays unique without inventing SLAs, rankings, or case studies.

import {
  services as cmsServices,
  servicePagesSeo as cmsServicePagesSeo,
  type ServicePagesSeoMap,
} from "@/lib/content";
import { CMS_SERVICE_SLUGS } from "@/lib/cms-services";

export type ServiceEntry = {
  slug: string;
  category: "Build" | "Grow" | "Create" | "Support";
  title: string;
  from: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  overview: string;
  /** HTML from the admin listing card, when this slug is one of the six CMS services */
  cmsDetail?: string;
  whatsIncluded: { title: string; description: string }[];
  process: { title: string; description: string }[];
  faq: { q: string; a: string }[];
  relatedSlugs: string[];
};

const pricingNote =
  "The final price depends on the work involved. We will agree the scope and costs before starting.";

export const servicePricingNote = pricingNote;

function steps(
  discover: string,
  scope: string,
  deliver: string,
  review: string,
  handover: string,
): ServiceEntry["process"] {
  return [
    { title: "Discover", description: discover },
    { title: "Scope", description: scope },
    { title: "Deliver", description: deliver },
    { title: "Review", description: review },
    { title: "Handover", description: handover },
  ];
}

const seedServicePages: ServiceEntry[] = [
  // ───── BUILD ─────
  {
    slug: "web-design",
    category: "Build",
    title: "Web design",
    from: "From £1,450",
    seoTitle: "Website design in London | Real Digital Works",
    seoDescription:
      "A website that explains your offer clearly and gives visitors a straightforward way to enquire. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "A website that explains your offer clearly and gives visitors a straightforward way to enquire. We design and develop responsive business websites with accessible navigation, clear page structure and practical content management.",
    overview:
      "The build is scoped around the pages, integrations and content your business needs rather than an off-the-shelf template. We agree the work, dependencies and review points so expectations are clear before design starts.",
    whatsIncluded: [
      {
        title: "Discovery and sitemap",
        description:
          "We map who the site is for, the pages you need, and the action each page should support before layout work begins.",
      },
      {
        title: "Responsive interface design",
        description:
          "Layouts for desktop and mobile that present your offer clearly, using real content rather than placeholder copy.",
      },
      {
        title: "Accessible navigation and forms",
        description:
          "Menus, headings and enquiry forms structured so people can find their way around and get in touch.",
      },
      {
        title: "SEO-friendly page structure",
        description:
          "Sensible URLs, headings and metadata so search engines can understand the site as it launches.",
      },
      {
        title: "Performance checks",
        description:
          "We review load behaviour and front-end weight before go-live and fix issues found in that pass.",
      },
      {
        title: "CMS/editor handover",
        description:
          "You get access and a walkthrough of how to update the pages and content agreed in the proposal.",
      },
    ],
    process: steps(
      "Discuss who the site is for, what visitors should do, and who will supply the content.",
      "Agree pages, integrations, access and review points in a written proposal.",
      "Design and build the agreed pages, navigation and forms.",
      "Test the site with your team and collect amends against the agreed scope.",
      "Hand over editor access, files and the next steps you asked for.",
    ),
    faq: [
      {
        q: "What does website design involve?",
        a: "We design and develop responsive business websites with accessible navigation, clear page structure and practical content management. The build is scoped around the pages, integrations and content your business needs rather than an off-the-shelf template.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Who the site is for, what action visitors should take, and who supplies the content.",
      },
      {
        q: "Can you work with our existing brand?",
        a: "Yes. We use the identity and copy you already have, or we can plan branding and writing as separate work.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on the pages, integrations and content involved. You receive a written quotation before work starts.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["ecommerce", "seo", "branding"],
  },
  {
    slug: "ecommerce",
    category: "Build",
    title: "Ecommerce",
    from: "From £2,800",
    seoTitle: "E-commerce website design in London | Real Digital Works",
    seoDescription:
      "Online shops designed to make products easy to find, understand and buy. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Online shops designed to make products easy to find, understand and buy. We plan catalogues, product variants, payment and delivery journeys around how the business actually operates.",
    overview:
      "Shopify and suitable custom solutions are considered according to product complexity, stock processes and integrations. Migration, payment providers and shipping connections are scoped after we understand the catalogue.",
    whatsIncluded: [
      {
        title: "Catalogue and collection planning",
        description:
          "Structure products, variants and collections so customers can find what they need without extra clicks.",
      },
      {
        title: "Product page templates",
        description:
          "Templates for images, options, shipping notes and related products, matched to how you sell.",
      },
      {
        title: "Basket and checkout journey",
        description:
          "A clear path from product to payment, with guest checkout where the platform allows it.",
      },
      {
        title: "Payment and delivery configuration",
        description:
          "Connect the payment and shipping methods agreed in the proposal. Feasibility is confirmed during scoping.",
      },
      {
        title: "Mobile usability",
        description:
          "Product browsing, options and checkout checked on small screens, where most shopping traffic arrives.",
      },
      {
        title: "Analytics and handover",
        description:
          "Purchase tracking set up for the agreed tools, plus a handover of how to add and edit products.",
      },
    ],
    process: steps(
      "Review products, variants, fulfilment rules and payment methods you need.",
      "Choose a suitable platform and agree catalogue, checkout and integration work.",
      "Build templates, configure payments and delivery, and load the agreed products.",
      "Test the purchase journey with your team before customers see it.",
      "Hand over store admin, tracking and the operating notes agreed in the proposal.",
    ),
    faq: [
      {
        q: "What does e-commerce website design involve?",
        a: "We plan catalogues, product variants, payment and delivery journeys around how the business actually operates. Shopify and suitable custom solutions are considered according to product complexity, stock processes and integrations.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "What products, variants, fulfilment rules and payment methods are required?",
      },
      {
        q: "Can you migrate an existing shop?",
        a: "Often yes. Product, customer and order moves are scoped after we see the current platform and catalogue size.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on catalogue complexity, integrations and any migration. You receive a written quotation before work starts.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["web-design", "copywriting", "google-ads"],
  },
  {
    slug: "web-applications",
    category: "Build",
    title: "Web applications",
    from: "Scoped",
    seoTitle: "Custom web application development in London | Real Digital Works",
    seoDescription:
      "Software built around your processes, not the limits of a generic template. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Software built around your processes, not the limits of a generic template. From client portals and internal dashboards to booking workflows and operational tools, we translate business requirements into a testable specification.",
    overview:
      "Architecture, access controls, integrations and delivery stages are defined before implementation. This is a bespoke-scoped service: we write a quotation against the agreed work rather than a standard package.",
    whatsIncluded: [
      {
        title: "Requirements workshops",
        description:
          "Workshops that turn users, records and workflows into a specification you can review before build starts.",
      },
      {
        title: "User roles and permissions",
        description:
          "Who can see and change what, documented as part of the scope rather than added later.",
      },
      {
        title: "UX and interface design",
        description:
          "Screens designed around the tasks people actually perform, not a generic admin theme.",
      },
      {
        title: "API integrations",
        description:
          "Connections to the systems named in the proposal, after we have confirmed access and feasibility.",
      },
      {
        title: "Testing and QA",
        description:
          "Checks against the agreed flows and edge cases before you use the software with real data.",
      },
      {
        title: "Documentation and handover",
        description:
          "Notes, access and the files agreed in the proposal so your team can operate what was built.",
      },
    ],
    process: steps(
      "Map which users, workflows, records and integrations are in scope.",
      "Agree outputs, access, responsibilities and a written specification.",
      "Build the agreed slices of the application against that specification.",
      "Test with your team and adjust within the agreed scope.",
      "Supply the agreed files, access and next steps.",
    ),
    faq: [
      {
        q: "What does custom web application development involve?",
        a: "From client portals and internal dashboards to booking workflows and operational tools, we translate business requirements into a testable specification. Architecture, access controls, integrations and delivery stages are defined before implementation.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Which users, workflows, records and integrations are in scope?",
      },
      {
        q: "Is this a fixed package?",
        a: "No. It is quoted against a written specification. We discuss your needs and define the deliverables in the proposal.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on the agreed work, complexity, resources and any external costs. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["ai-automation", "hosting", "training"],
  },
  {
    slug: "landing-pages",
    category: "Build",
    title: "Landing pages",
    from: "From £650",
    seoTitle: "Landing page design in London | Real Digital Works",
    seoDescription:
      "Focused landing pages built around one audience, one offer and one clear action. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Focused landing pages built around one audience, one offer and one clear action. We align the message, page layout and measurement plan with the campaign goal.",
    overview:
      "These pages exist to convert a specific campaign, not to replace a full website. Copy, layout and tracking are scoped together so the page matches the ads or emails that send people there.",
    whatsIncluded: [
      {
        title: "Audience and offer",
        description:
          "We pin down who the page is for and the single offer they should respond to.",
      },
      {
        title: "Message alignment",
        description:
          "Headlines and supporting copy matched to the campaign that will drive the traffic.",
      },
      {
        title: "Page layout",
        description:
          "A mobile-first layout that leads to one action, without extra navigation competing for attention.",
      },
      {
        title: "Single call to action",
        description:
          "Form, call or booking path designed around the one conversion the campaign needs.",
      },
      {
        title: "Measurement plan",
        description:
          "The events and destinations agreed in the proposal, connected to the campaign tools you use.",
      },
      {
        title: "Campaign handover",
        description:
          "Live URL, tracking notes and guidance on what to change if the offer or audience shifts.",
      },
    ],
    process: steps(
      "Confirm the audience, offer and the action the page must drive.",
      "Agree layout, copy, tracking and where the traffic will come from.",
      "Design and build the page against that brief.",
      "Check the journey and tracking with you before launch.",
      "Hand over the live page and the measurement notes.",
    ),
    faq: [
      {
        q: "What does landing page design involve?",
        a: "Focused landing pages built around one audience, one offer and one clear action. We align the message, page layout and measurement plan with the campaign goal.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "The campaign goal, where traffic will come from, and the action you want visitors to take.",
      },
      {
        q: "Can you write the copy?",
        a: "Yes, if that is included in the proposal. Otherwise we work from copy you supply.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on design, copy, variants and tracking. You receive a written quotation before work starts.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["web-design", "google-ads", "copywriting"],
  },

  // ───── GROW ─────
  {
    slug: "seo",
    category: "Grow",
    title: "SEO",
    from: "From £550 / month",
    seoTitle: "SEO agency in London for Google and AI search | Real Digital Works",
    seoDescription:
      "Make your website easier to discover, understand and use. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Make your website easier to discover, understand and use. We review technical foundations, local business information, content and the questions customers actually search for.",
    overview:
      "AI-search visibility work focuses on clarity, crawlability and credible references. No provider can guarantee inclusion in AI-generated answers or a particular ranking.",
    whatsIncluded: [
      {
        title: "Technical SEO review",
        description:
          "Crawlability, indexation, page structure and obvious technical blockers on the current site.",
      },
      {
        title: "Keyword and intent mapping",
        description:
          "The questions and services that matter for your audience, mapped to pages you have or can create.",
      },
      {
        title: "Google Business Profile review",
        description:
          "A check of local listing information, categories and consistency with the website.",
      },
      {
        title: "On-page optimisation",
        description:
          "Titles, headings and content adjustments on the pages agreed in the plan.",
      },
      {
        title: "Content planning",
        description:
          "A practical list of pages or articles worth writing, based on demand rather than guesswork.",
      },
      {
        title: "Structured data where relevant",
        description:
          "Markup that matches visible content, used only where it helps machines understand the page.",
      },
    ],
    process: steps(
      "Identify which services, areas and customer questions matter most.",
      "Agree the technical, content and local work that will be in the plan.",
      "Carry out the agreed review, on-page work and content tasks.",
      "Review progress with you against the plan, not against promised positions.",
      "Hand over findings, access notes and recommended next steps.",
    ),
    faq: [
      {
        q: "What does SEO and AI search visibility involve?",
        a: "We review technical foundations, local business information, content and the questions customers actually search for. AI-search visibility work focuses on clarity, crawlability and credible references; no provider can guarantee inclusion in AI-generated answers.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Which services, areas and customer questions matter most?",
      },
      {
        q: "Do you guarantee rankings?",
        a: "No. Search results and AI answers are outside anyone’s control. We agree the work, report on it, and avoid methods that put the site at risk.",
      },
      {
        q: "How is the price calculated?",
        a: "Monthly work is quoted against the agreed plan. Advertising, tools and third-party costs sit outside that fee unless the proposal says otherwise.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process. Useful movement in search usually takes months, not days.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["google-ads", "copywriting", "web-design"],
  },
  {
    slug: "google-ads",
    category: "Grow",
    title: "Google Ads",
    from: "From £450 / month",
    seoTitle: "Google Ads management in London | Real Digital Works",
    seoDescription:
      "Paid search campaigns built around relevant enquiries and measurable actions. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Paid search campaigns built around relevant enquiries and measurable actions. We review or configure campaign structure, targeting, ad copy and conversion measurement, then optimise based on the data available.",
    overview:
      "The advertising budget is separate from management fees. We do not promise profitability, a fixed cost per lead or a launch date until the account and tracking are understood.",
    whatsIncluded: [
      {
        title: "Account review or setup",
        description:
          "A structured account, or a review of an existing one, before campaigns are changed.",
      },
      {
        title: "Keyword and search-term planning",
        description:
          "Terms worth bidding on, based on how people search for the services you sell.",
      },
      {
        title: "Ad copy",
        description:
          "Ads written around the offer and the landing page, then adjusted from performance data.",
      },
      {
        title: "Negative keywords",
        description:
          "Search terms that waste budget, added and maintained as the account learns.",
      },
      {
        title: "Conversion measurement",
        description:
          "The actions that count as a lead or sale, tracked with the tools agreed in the proposal.",
      },
      {
        title: "Budget and bid reviews",
        description:
          "Regular checks of spend, bids and search terms, with a monthly report of what changed.",
      },
    ],
    process: steps(
      "Define what counts as a valuable lead or sale and the planned ad budget.",
      "Agree campaigns, tracking and landing-page requirements.",
      "Build or adjust the account against that plan.",
      "Review results with you and change what the data supports.",
      "Hand over access, reporting and recommended next steps.",
    ),
    faq: [
      {
        q: "What does Google Ads management involve?",
        a: "We review or configure campaign structure, targeting, ad copy and conversion measurement, then optimise based on the data available. The advertising budget is separate from management fees.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "What counts as a valuable lead or sale, and what is the planned ad budget?",
      },
      {
        q: "Can you take over an existing account?",
        a: "Yes. We review the account before changing campaigns so tracking and history are understood first.",
      },
      {
        q: "How is the price calculated?",
        a: "Management is quoted separately from Google’s media spend. You receive a written quotation for the work.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["seo", "web-design", "social-media"],
  },
  {
    slug: "social-media",
    category: "Grow",
    title: "Social media",
    from: "From £395 / month",
    seoTitle: "Social media management in London | Real Digital Works",
    seoDescription:
      "A consistent social presence that sounds and looks like your business. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "A consistent social presence that sounds and looks like your business. We develop a practical channel and content plan, prepare approved assets and organise publishing around agreed objectives.",
    overview:
      "Community management, video production and paid campaigns are quoted according to the required workload. They are not assumed as part of a standard posting plan.",
    whatsIncluded: [
      {
        title: "Channel strategy",
        description:
          "Which platforms are worth using for your audience, and what each one is for.",
      },
      {
        title: "Content calendar",
        description:
          "A planned set of posts for the period agreed, shared for approval before publishing.",
      },
      {
        title: "Copy and graphic production",
        description:
          "On-brand captions and stills for the posts in that calendar. Video is scoped separately if needed.",
      },
      {
        title: "Scheduling",
        description:
          "Publishing at the times and on the channels named in the plan.",
      },
      {
        title: "Approval workflow",
        description:
          "You see content before it goes live. Nothing publishes without the sign-off you asked for.",
      },
      {
        title: "Performance review",
        description:
          "A regular look at what was published and how people responded, used to plan the next period.",
      },
    ],
    process: steps(
      "Confirm which channels, post volume and approval responsibilities are required.",
      "Agree the content plan, assets and anything that sits outside posting.",
      "Produce, schedule and publish the agreed work.",
      "Review performance with you and adjust the next calendar.",
      "Hand over assets, access and notes for the period just completed.",
    ),
    faq: [
      {
        q: "What does social media marketing involve?",
        a: "We develop a practical channel and content plan, prepare approved assets and organise publishing around agreed objectives. Community management, video production and paid campaigns are quoted according to the required workload.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Which channels, post volume and approval responsibilities are required?",
      },
      {
        q: "Is paid social included?",
        a: "Only if the proposal says so. Paid campaigns, response coverage and video production are quoted separately.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on channels, volume and extra work such as video or ads. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["photography", "3d-animation", "google-ads"],
  },
  {
    slug: "email-marketing",
    category: "Grow",
    title: "Email marketing",
    from: "From £295 / month",
    seoTitle: "Email marketing services in London | Real Digital Works",
    seoDescription:
      "Useful email campaigns and customer journeys built around permission, relevance and clear calls to action. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Useful email campaigns and customer journeys built around permission, relevance and clear calls to action. We can review list quality, templates, segmentation and automation requirements.",
    overview:
      "Work is scoped around the platform you already use, or a suitable alternative if you are starting from scratch. Automations are only included when they are named in the proposal.",
    whatsIncluded: [
      {
        title: "List quality review",
        description:
          "A look at how people join the list, consent, and whether the data is usable.",
      },
      {
        title: "Templates",
        description:
          "On-brand email layouts that work on mobile and keep the message easy to scan.",
      },
      {
        title: "Segmentation",
        description:
          "Groups based on the data you actually have, so messages can be more relevant.",
      },
      {
        title: "Campaigns",
        description:
          "Planned sends with a clear offer and call to action, written for the audience you named.",
      },
      {
        title: "Automation requirements",
        description:
          "Welcome, reminder or follow-up flows only where they are agreed in the scope.",
      },
      {
        title: "Reporting",
        description:
          "A regular summary of sends, engagement and what to try next, without inflating results.",
      },
    ],
    process: steps(
      "Review the list, platform and the journeys you want email to support.",
      "Agree templates, campaigns, automations and who approves sends.",
      "Build and send the agreed work.",
      "Review results with you and adjust the next period.",
      "Hand over templates, access and notes.",
    ),
    faq: [
      {
        q: "What does email marketing involve?",
        a: "Useful email campaigns and customer journeys built around permission, relevance and clear calls to action. We can review list quality, templates, segmentation and automation requirements.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Which platform you use, how people join the list, and whether you need campaigns, automations or both.",
      },
      {
        q: "Do you write the emails?",
        a: "Yes, when copy is included in the proposal. Otherwise we work from copy you supply.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on send volume, automations and platform work. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["copywriting", "social-media", "web-design"],
  },

  // ───── CREATE ─────
  {
    slug: "branding",
    category: "Create",
    title: "Branding",
    from: "From £1,100",
    seoTitle: "Branding and logo design in London | Real Digital Works",
    seoDescription:
      "A recognisable identity that works across the places customers meet your business. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "A recognisable identity that works across the places customers meet your business. Branding goes beyond a single logo: we develop a coherent visual direction and document how colours, typography and imagery should be used.",
    overview:
      "Number of concepts, revision rounds, file formats and intellectual property terms are set in the proposal. We ask whether you are launching, refreshing or fully repositioning before design starts.",
    whatsIncluded: [
      {
        title: "Brand discovery",
        description:
          "Audience, competitors and the impression you want to make, captured before visual work.",
      },
      {
        title: "Logo directions",
        description:
          "Explored routes for the mark, then refined against the direction you choose.",
      },
      {
        title: "Colour palette",
        description:
          "A practical set of colours that can be used on screen and in print.",
      },
      {
        title: "Typography guidance",
        description:
          "Type choices and usage notes so headings and body copy stay consistent.",
      },
      {
        title: "Brand applications",
        description:
          "Examples of the identity on the surfaces named in the proposal, such as web or social.",
      },
      {
        title: "Brand guidelines",
        description:
          "A document covering the agreed mark, colour, type and usage so suppliers can follow it.",
      },
    ],
    process: steps(
      "Confirm whether you are launching, refreshing or repositioning the brand.",
      "Agree deliverables, concepts, revisions and file formats.",
      "Develop the visual direction and the applications in scope.",
      "Review with you and refine within the agreed rounds.",
      "Hand over the files and guidelines named in the proposal.",
    ),
    faq: [
      {
        q: "What does branding and logo design involve?",
        a: "Branding goes beyond a single logo. We develop a coherent visual direction, explore suitable logo applications and document how colours, typography and imagery should be used consistently.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Are you launching, refreshing or fully repositioning the brand?",
      },
      {
        q: "Can you refresh an existing identity?",
        a: "Yes. Much of the work is tightening what you already have rather than starting from nothing.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on the deliverables, applications and revision rounds. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["web-design", "photography", "copywriting"],
  },
  {
    slug: "3d-animation",
    category: "Create",
    title: "3D & animation",
    from: "From £450",
    seoTitle: "3D animation and video production in London | Real Digital Works",
    seoDescription:
      "Explain ideas, show products and communicate visually through motion. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Explain ideas, show products and communicate visually through motion. We plan the intended audience, story, format and production approach before modelling or animating.",
    overview:
      "Projects may involve product visualisation, explainers, motion graphics or architectural visuals depending on scope. A starting figure does not cover a complete bespoke animation unless the proposal says so.",
    whatsIncluded: [
      {
        title: "Creative brief",
        description:
          "Audience, message, length and where the film will appear, written down before production.",
      },
      {
        title: "Storyboard or visual direction",
        description:
          "A shot plan or stills you can approve before time is spent on modelling or animation.",
      },
      {
        title: "3D modelling where needed",
        description:
          "Models and materials for the objects or spaces the brief requires.",
      },
      {
        title: "Animation and motion design",
        description:
          "Movement, timing and graphics for the sequences in the agreed shot list.",
      },
      {
        title: "Rendering and editing",
        description:
          "The approved shots rendered and assembled into the running time you asked for.",
      },
      {
        title: "Export formats",
        description:
          "Files delivered in the sizes and formats named in the proposal.",
      },
    ],
    process: steps(
      "Confirm what the viewer must understand and where the video will appear.",
      "Agree length, style, revisions and delivery formats.",
      "Produce the approved shots and edit them together.",
      "Review with you against the brief and the agreed revision rounds.",
      "Hand over the export files named in the proposal.",
    ),
    faq: [
      {
        q: "What does 3D animation and video involve?",
        a: "We plan the intended audience, story, format and production approach before modelling or animating. Projects may involve product visualisation, explainers, motion graphics or architectural visuals depending on scope.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "What must the viewer understand, and where will the video appear?",
      },
      {
        q: "Can you animate a product from CAD?",
        a: "Often yes, if we can use your files or clear reference. Feasibility is confirmed when we see the source material.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on length, complexity, modelling and revisions. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["social-media", "branding", "web-design"],
  },
  {
    slug: "photography",
    category: "Create",
    title: "Photography",
    from: "From £350",
    seoTitle: "Commercial photography in London | Real Digital Works",
    seoDescription:
      "Original photography that reflects your people, products and premises. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Original photography that reflects your people, products and premises. Photography is planned around intended use, location, shot list and deliverables.",
    overview:
      "Editing, image sizes and permitted commercial usage are agreed in the proposal. Studio, travel and retouching are confirmed before the shoot day.",
    whatsIncluded: [
      {
        title: "Shot list and planning",
        description:
          "What is being photographed, where, and how the images will be used, agreed before the day.",
      },
      {
        title: "Product and team imagery",
        description:
          "Photographs of people, products or spaces named in the brief.",
      },
      {
        title: "On-location options",
        description:
          "Studio or location as scoped. Travel and access needs are confirmed in the proposal.",
      },
      {
        title: "Selection and editing",
        description:
          "A set of selects, then the agreed retouching on the images you choose.",
      },
      {
        title: "Web-ready exports",
        description:
          "Files sized for the uses named in the brief, alongside any print versions you asked for.",
      },
      {
        title: "Licensing details",
        description:
          "Usage terms written into the proposal so you know where the images can appear.",
      },
    ],
    process: steps(
      "Confirm what is being photographed, where, and how many final images you need.",
      "Agree shot list, location, usage and retouching.",
      "Shoot the agreed list and prepare selects.",
      "Edit the chosen images and review them with you.",
      "Hand over the files and the usage terms.",
    ),
    faq: [
      {
        q: "What does photography involve?",
        a: "Photography is planned around intended use, location, shot list and deliverables. Editing, image sizes and permitted commercial usage are agreed in the proposal.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "What is being photographed, where, and how many final images are needed?",
      },
      {
        q: "Do you shoot on location?",
        a: "Yes, when the proposal includes it. Access, travel and time on site are scoped before the day.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on time, location, image count and retouching. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["ecommerce", "social-media", "web-design"],
  },
  {
    slug: "copywriting",
    category: "Create",
    title: "Copywriting",
    from: "From £195",
    seoTitle: "Copywriting services in London | Real Digital Works",
    seoDescription:
      "Clear, useful words that help customers understand why to choose you. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Clear, useful words that help customers understand why to choose you. We write around the audience, the offer and the action each page should support.",
    overview:
      "Content can include web pages, articles, product descriptions, advertising and email copy, with search intent considered where appropriate. Word count, research and revision rounds are defined in the proposal.",
    whatsIncluded: [
      {
        title: "Discovery and tone",
        description:
          "A read of how you already sound, and who the writing is for, before drafting starts.",
      },
      {
        title: "Page outlines",
        description:
          "Structure for each piece so the argument is clear before full copy is written.",
      },
      {
        title: "Keyword context",
        description:
          "Search phrases used as context where they help, without stuffing pages with terms.",
      },
      {
        title: "Website copy",
        description:
          "Pages named in the proposal, written to explain the offer and the next step.",
      },
      {
        title: "Articles and campaigns",
        description:
          "Longer pieces or campaign copy when they are included in the scope.",
      },
      {
        title: "Editing and review",
        description:
          "Amends against the rounds agreed, so the final text matches your voice.",
      },
    ],
    process: steps(
      "Confirm the audience and what they must know before taking action.",
      "Agree pieces, length, research and revision rounds.",
      "Write the outlines and then the full copy.",
      "Edit with you against the brief.",
      "Hand over the final text in the format you asked for.",
    ),
    faq: [
      {
        q: "What does copywriting involve?",
        a: "We write around the audience, the offer and the action each page should support. Content can include web pages, articles, product descriptions, advertising and email copy, with search intent considered where appropriate.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Who is the audience and what must they know before taking action?",
      },
      {
        q: "Do you research topics or work from our briefs?",
        a: "Either. Research needs are part of the quotation so the unit of work is clear.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on length, research and the number of pieces. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["seo", "web-design", "branding"],
  },

  // ───── SUPPORT ─────
  {
    slug: "hosting",
    category: "Support",
    title: "Hosting & care",
    from: "From £95 / month",
    seoTitle: "Managed website hosting and care in London | Real Digital Works",
    seoDescription:
      "Practical support for keeping your website maintained after launch. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Practical support for keeping your website maintained after launch. We can discuss hosting, monitoring, backups, updates and planned changes as part of an agreed care arrangement.",
    overview:
      "Service levels depend on the hosting environment, website technology and selected plan. Who controls the domain, hosting account and credentials is confirmed before anything is moved.",
    whatsIncluded: [
      {
        title: "Hosting review",
        description:
          "A look at where the site lives now and whether a move or a stay-put plan makes more sense.",
      },
      {
        title: "Backups and recovery plan",
        description:
          "How copies are taken and how a restore would be requested, written into the plan you choose.",
      },
      {
        title: "Update responsibilities",
        description:
          "Who applies CMS, plugin or dependency updates, and how those updates are checked.",
      },
      {
        title: "Security considerations",
        description:
          "Practical configuration and access hygiene for the stack in use, without claiming a specialist SOC.",
      },
      {
        title: "Performance monitoring",
        description:
          "Watching whether the site is reachable and flagging issues we can see from that monitoring.",
      },
      {
        title: "Support and change requests",
        description:
          "A defined way to ask for copy, image or small layout changes, limited to what the plan includes.",
      },
    ],
    process: steps(
      "Confirm who controls the domain, hosting account and credentials.",
      "Agree the plan, environment and what is in or out of monthly care.",
      "Set up or take over the agreed hosting and maintenance tasks.",
      "Review the arrangement with you and adjust the plan if needed.",
      "Document access, backups and how to request changes.",
    ),
    faq: [
      {
        q: "What do domains, hosting and care plans involve?",
        a: "We can discuss hosting, monitoring, backups, updates and planned changes as part of an agreed care arrangement. Service levels depend on the hosting environment, website technology and selected plan.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Who controls the domain, hosting account and credentials?",
      },
      {
        q: "Do we have to host with you?",
        a: "No. Care can be quoted for a site that stays where it is, if we can obtain the access needed.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on the environment, the plan and the change allowance. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["web-design", "web-applications", "training"],
  },
  {
    slug: "training",
    category: "Support",
    title: "Training",
    from: "From £250",
    seoTitle: "AI and digital skills training in London | Real Digital Works",
    seoDescription:
      "Give your team the confidence to use digital tools independently. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Give your team the confidence to use digital tools independently. Training can be shaped around real tasks, from website editing and analytics to AI workflows, search and creative software.",
    overview:
      "We agree the audience, format, prerequisites and practical outcomes before the session. Recordings, certificates, venue and follow-up support are optional unless the proposal includes them.",
    whatsIncluded: [
      {
        title: "Needs assessment",
        description:
          "Who is attending, what they already know, and the tasks they need to complete afterwards.",
      },
      {
        title: "Learning objectives",
        description:
          "A short list of outcomes so the session is judged against useful skills, not a slide count.",
      },
      {
        title: "Tailored exercises",
        description:
          "Practice using your tools and examples, not a generic course deck.",
      },
      {
        title: "Live instruction",
        description:
          "A live session in person or remote, in the format agreed in the proposal.",
      },
      {
        title: "Practical examples",
        description:
          "Worked examples drawn from the software and workflows your team actually uses.",
      },
      {
        title: "Follow-up options",
        description:
          "Notes or a later Q&A if those are included. They are not assumed as standard.",
      },
    ],
    process: steps(
      "Confirm who is attending and what they should be able to do afterwards.",
      "Agree format, duration, materials and any follow-up.",
      "Run the session against those objectives.",
      "Review with you whether the outcomes were met.",
      "Hand over any notes, recordings or next-step training that were agreed.",
    ),
    faq: [
      {
        q: "What does training involve?",
        a: "Training can be shaped around real tasks, from website editing and analytics to AI workflows, search and creative software. We agree the audience, format, prerequisites and practical outcomes before the session.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "Who is attending and what should they be able to do afterwards?",
      },
      {
        q: "Can you train a whole team?",
        a: "Yes, group or one-to-one. Group size, location and whether the session is recorded are set in the proposal.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on duration, group size, venue and materials. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["ai-automation", "social-media", "3d-animation"],
  },
  {
    slug: "ai-automation",
    category: "Support",
    title: "AI & automation",
    from: "From £900",
    seoTitle: "AI automation services in London | Real Digital Works",
    seoDescription:
      "Reduce repetitive work by improving one practical workflow at a time. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Reduce repetitive work by improving one practical workflow at a time. We map manual steps, identify sensible automation opportunities and design controlled workflows that connect approved tools.",
    overview:
      "Each project starts with a clear trigger, action, exception and review process. Third-party usage fees, integrations and ongoing monitoring are scoped separately.",
    whatsIncluded: [
      {
        title: "Workflow audit",
        description:
          "A map of the manual process you want to improve, including who owns it today.",
      },
      {
        title: "Opportunity prioritisation",
        description:
          "Which steps are worth automating first, and which should stay with a person.",
      },
      {
        title: "Data and access review",
        description:
          "What information the workflow needs and which tools we are allowed to connect.",
      },
      {
        title: "Automation design",
        description:
          "A designed flow with a trigger, actions and a defined exception path.",
      },
      {
        title: "Exception handling",
        description:
          "What happens when the automation cannot complete the task, including human handover.",
      },
      {
        title: "Testing and iteration",
        description:
          "Trials against real examples, then adjustments within the agreed scope.",
      },
    ],
    process: steps(
      "Identify the slow manual process, who owns it, and what must happen when something fails.",
      "Agree tools, access, exceptions and success criteria.",
      "Build the first workflow against that design.",
      "Test with your team and refine the exception path.",
      "Hand over the flow, access and how to request changes.",
    ),
    faq: [
      {
        q: "What does AI and automation involve?",
        a: "We map manual steps, identify sensible automation opportunities and design controlled workflows that connect approved tools. Each project starts with a clear trigger, action, exception and review process.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "What manual process is slow, who owns it, and what must happen when something fails?",
      },
      {
        q: "Do you start with a chatbot?",
        a: "Only if that is the workflow you need. Most work starts with one internal process that wastes time.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on the workflow, integrations and monitoring. Tooling fees sit outside the build unless the proposal includes them.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["web-applications", "training", "seo"],
  },
  {
    slug: "consultancy",
    category: "Support",
    title: "Consultancy",
    from: "From £195 / hour",
    seoTitle: "Digital consultancy in London | Real Digital Works",
    seoDescription:
      "Independent, practical guidance for businesses reviewing websites, marketing, software choices or digital suppliers. Discuss a tailored project with Real Digital Works in London.",
    intro:
      "Independent, practical guidance for businesses reviewing websites, marketing, software choices or digital suppliers. We agree the questions to answer and provide prioritised next steps.",
    overview:
      "Engagements are quoted as a workshop, written review or retained advisory against a defined brief. We do not treat consultancy as a way to sell an unrelated build unless you ask for that next.",
    whatsIncluded: [
      {
        title: "Question set",
        description:
          "The decisions you need to make, written down before we review anything.",
      },
      {
        title: "Website and marketing review",
        description:
          "A look at the channels and pages relevant to those questions, not a generic audit checklist.",
      },
      {
        title: "Software and supplier choices",
        description:
          "Options and trade-offs for tools or suppliers you are already considering.",
      },
      {
        title: "Prioritised next steps",
        description:
          "A short list of what to do first, what can wait, and what needs a separate project.",
      },
      {
        title: "Written findings",
        description:
          "Notes you can share internally, limited to the brief we agreed.",
      },
      {
        title: "Follow-on conversation",
        description:
          "A debrief to walk through the recommendations. Ongoing advisory is quoted separately.",
      },
    ],
    process: steps(
      "Agree the questions to answer and the materials we will need.",
      "Set the format, time and written outputs.",
      "Review the agreed materials and hold any workshop in the brief.",
      "Walk through findings with you.",
      "Hand over the written next steps.",
    ),
    faq: [
      {
        q: "What does digital consultancy involve?",
        a: "Independent, practical guidance for businesses reviewing websites, marketing, software choices or digital suppliers. We agree the questions to answer and provide prioritised next steps.",
      },
      {
        q: "What should we prepare before contacting you?",
        a: "The decision you need to make, and any current site, ads account or supplier relationship we should look at.",
      },
      {
        q: "Are you independent of a build?",
        a: "Consultancy is quoted on its own. If you later want us to implement something, that is a separate proposal.",
      },
      {
        q: "How is the price calculated?",
        a: "Pricing depends on time, materials and whether you need a written report. You receive a written quotation.",
      },
      {
        q: "How long will it take?",
        a: "We agree a realistic timetable after reviewing the scope, access requirements and feedback process.",
      },
      {
        q: "What happens after delivery?",
        a: "We provide the agreed handover and can discuss a separate support arrangement where appropriate.",
      },
    ],
    relatedSlugs: ["web-design", "seo", "web-applications"],
  },
];

function applyCmsOverlays(pages: ServiceEntry[]): ServiceEntry[] {
  const cmsBySlug = Object.fromEntries(
    cmsServices
      .map((s) => [CMS_SERVICE_SLUGS[s.id], s] as const)
      .filter(([slug]) => Boolean(slug)),
  );

  return pages.map((page) => {
    const cms = cmsBySlug[page.slug];
    const seo = cmsServicePagesSeo[page.slug];
    return {
      ...page,
      title: cms?.title?.trim() || page.title,
      from: cms?.from?.trim() || page.from,
      intro: cms?.summary?.trim() || page.intro,
      cmsDetail: cms?.detail?.trim() || undefined,
      seoTitle: seo?.seoTitle?.trim() || page.seoTitle,
      seoDescription: seo?.seoDescription?.trim() || page.seoDescription,
    };
  });
}

export const servicePages: ServiceEntry[] = applyCmsOverlays(seedServicePages);

export function seedServicePageSeo(): ServicePagesSeoMap {
  return Object.fromEntries(
    seedServicePages.map((s) => [s.slug, { seoTitle: s.seoTitle, seoDescription: s.seoDescription }]),
  );
}

export function mergeServicePagesSeo(fromFs?: ServicePagesSeoMap): ServicePagesSeoMap {
  const defaults = seedServicePageSeo();
  const merged: ServicePagesSeoMap = {};
  for (const slug of Object.keys(defaults)) {
    merged[slug] = {
      seoTitle: fromFs?.[slug]?.seoTitle?.trim() || defaults[slug].seoTitle,
      seoDescription: fromFs?.[slug]?.seoDescription?.trim() || defaults[slug].seoDescription,
    };
  }
  return merged;
}

export const serviceCategories = [
  { label: "Build", slugs: ["web-design", "ecommerce", "web-applications", "landing-pages"] },
  { label: "Grow", slugs: ["seo", "google-ads", "social-media", "email-marketing"] },
  { label: "Create", slugs: ["branding", "3d-animation", "photography", "copywriting"] },
  { label: "Support", slugs: ["hosting", "training", "ai-automation", "consultancy"] },
] as const;

export function getServiceBySlug(slug: string): ServiceEntry | undefined {
  return servicePages.find((s) => s.slug === slug);
}
