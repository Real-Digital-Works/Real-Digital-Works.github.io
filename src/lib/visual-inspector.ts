import type { Content } from "@/lib/content";
import { CTA_BY_ID } from "@/lib/cms-ui";
import { fieldLabel } from "@/lib/visual-editor";

export type InspectorSelection =
  | { kind: "text"; path: string }
  | { kind: "link"; id: string }
  | { kind: "nav"; id: string }
  | { kind: "popup"; id: string };

export type InspectorItem = {
  id: string;
  kind: "text" | "link" | "nav" | "popup" | "seo";
  label: string;
  path?: string;
  linkId?: string;
  navId?: string;
  popupId?: string;
};

export type InspectorGroup = {
  id: string;
  title: string;
  items: InspectorItem[];
};

function pathOf(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

function textItem(path: string, label: string): InspectorItem {
  return { id: `text:${path}`, kind: "text", path, label };
}

function linkItem(linkId: string, label?: string): InspectorItem {
  return {
    id: `link:${linkId}`,
    kind: "link",
    linkId,
    label: label ?? CTA_BY_ID[linkId]?.title ?? "Link",
  };
}

function navItem(id: string, label: string): InspectorItem {
  return { id: `nav:${id}`, kind: "nav", navId: id, label };
}

export function inspectorItemId(selection: InspectorSelection | null): string | null {
  if (!selection) return null;
  if (selection.kind === "text") return `text:${selection.path}`;
  if (selection.kind === "link") return `link:${selection.id}`;
  if (selection.kind === "nav") return `nav:${selection.id}`;
  return `popup:${selection.id}`;
}

function pageCoreItems(pathname: string, draft: Content): InspectorItem[] {
  const path = pathOf(pathname);

  if (path === "/") {
    return [
      textItem("hero.eyebrow", "Eyebrow"),
      textItem("hero.headline", "Heading"),
      textItem("hero.sub", "Intro"),
      linkItem("hero.primary", "Primary button"),
      linkItem("hero.secondary", "Secondary button"),
    ];
  }

  const legalKey =
    path === "/privacy" ? "privacy" : path === "/terms" ? "terms" : path === "/modern-slavery" ? "modernSlavery" : null;
  if (legalKey) {
    const names = { privacy: "Privacy", terms: "Terms", modernSlavery: "Modern slavery" } as const;
    return [
      textItem(`legal.${legalKey}.title`, "Heading"),
      textItem(`legal.${legalKey}.body`, `${names[legalKey]} body`),
    ];
  }

  const introKey = (
    {
      "/about": "about",
      "/contact": "contact",
      "/pricing": "pricing",
      "/services": "services",
      "/blog": "blog",
    } as const
  )[path];
  if (introKey) {
    const items = [
      textItem(`pageIntros.${introKey}.eyebrow`, "Eyebrow"),
      textItem(`pageIntros.${introKey}.headline`, "Heading"),
      textItem(`pageIntros.${introKey}.sub`, "Intro"),
    ];
    if (introKey === "services") items.push(textItem("pageIntros.services.viewLabel", "View service label"));
    if (introKey === "contact") {
      items.push(linkItem("contact.phone", "Call button"));
      items.push(linkItem("contact.whatsapp", "WhatsApp button"));
      items.push(linkItem("contact.email", "Email button"));
    }
    return items;
  }

  if (path === "/work") {
    return [
      textItem("workPage.eyebrow", "Eyebrow"),
      textItem("workPage.headline", "Heading"),
      textItem("workPage.sub", "Intro"),
    ];
  }

  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const slug = serviceMatch[1];
    return [
      textItem(`svc.${slug}.title`, "Heading"),
      textItem(`svc.${slug}.intro`, "Intro"),
      textItem(`svc.${slug}.overview`, "Overview"),
      textItem(`svc.${slug}.detail`, "Body"),
    ];
  }

  const workMatch = path.match(/^\/work\/([^/]+)$/);
  if (workMatch) {
    const slug = workMatch[1];
    return [
      textItem(`project.${slug}.title`, "Heading"),
      textItem(`project.${slug}.summary`, "Intro"),
      textItem(`project.${slug}.problem`, "Problem"),
      textItem(`project.${slug}.work`, "Work"),
      textItem(`project.${slug}.outcome`, "Outcome"),
    ];
  }

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    return [
      textItem(`blogPost.${slug}.title`, "Heading"),
      textItem(`blogPost.${slug}.excerpt`, "Intro"),
      textItem(`blogPost.${slug}.content`, "Body"),
    ];
  }

  if (path === "/not-found" || path.endsWith("/not-found")) {
    return [
      textItem("pageIntros.notfound.eyebrow", "Eyebrow"),
      textItem("pageIntros.notfound.headline", "Heading"),
      textItem("pageIntros.notfound.sub", "Intro"),
    ];
  }

  const pageSlug = path.replace(/^\//, "");
  const cmsPage = (draft.pages ?? []).find((row) => row.slug === pageSlug);
  if (cmsPage) {
    return [
      textItem(`cmsPage.${pageSlug}.title`, "Heading"),
      textItem(`cmsPage.${pageSlug}.content`, "Body"),
    ];
  }

  return [];
}

function extraPageGroups(pathname: string, draft: Content): InspectorGroup[] {
  const path = pathOf(pathname);
  if (path !== "/") return [];
  return [
    {
      id: "page-offer",
      title: "This page · Offer",
      items: [
        textItem("homeSections.scrollCue", "Scroll cue"),
        textItem("homeSections.offerEyebrow", "Eyebrow"),
        textItem("homeSections.offerTitle", "Heading"),
        textItem("homeSections.offerOpen", "Open services"),
      ],
    },
    {
      id: "page-desk",
      title: "This page · Enquiry desk",
      items: [
        textItem("homeSections.deskEyebrow", "Eyebrow"),
        textItem("homeSections.deskTitle", "Heading"),
        textItem("homeSections.deskIntro", "Intro"),
      ],
    },
    {
      id: "page-work",
      title: "This page · Work",
      items: [
        textItem("homeSections.workEyebrow", "Eyebrow"),
        textItem("homeSections.workTitle", "Heading"),
        linkItem("home.openCase", "Open the case"),
      ],
    },
    {
      id: "page-process",
      title: "This page · Process",
      items: [
        textItem("homeSections.processEyebrow", "Eyebrow"),
        ...(draft.process ?? []).slice(0, 4).map((step, i) => textItem(`process.${i}.title`, `Step ${i + 1}`)),
      ],
    },
    {
      id: "page-faq",
      title: "This page · Questions",
      items: [
        textItem("homeSections.faqEyebrow", "Eyebrow"),
        textItem("homeSections.faqTitle", "Heading"),
      ],
    },
  ];
}

function headerItems(draft: Content): InspectorItem[] {
  const top = (draft.navItems ?? []).filter((item) => !item.hidden);
  return [
    textItem("site.name", "Studio name"),
    linkItem("header.logo", "Logo link"),
    linkItem("header.brief", "Start a brief"),
    ...top.map((item) => navItem(item.id, item.label)),
  ];
}

function itemFromSelection(selection: InspectorSelection): InspectorItem {
  if (selection.kind === "text") {
    return textItem(selection.path, fieldLabel(selection.path));
  }
  if (selection.kind === "link") {
    return linkItem(selection.id);
  }
  if (selection.kind === "nav") {
    return navItem(selection.id, "Menu link");
  }
  return { id: `popup:${selection.id}`, kind: "popup", popupId: selection.id, label: "Pop-up" };
}

export function groupIdForSelection(selection: InspectorSelection | null, pathname: string): string {
  if (!selection) return "page";
  if (selection.kind === "popup") return "popups";
  if (selection.kind === "nav") return "header";
  if (selection.kind === "link") {
    const id = selection.id;
    if (id.startsWith("header.")) return "header";
    if (id === "footer.phone" || id === "footer.email" || id === "footer.logo") return "footer-studio";
    if (id === "footer.privacy" || id === "footer.terms" || id === "footer.modernSlavery") return "footer-legal";
    if (id.startsWith("footer.")) return "footer-company";
    if (id.startsWith("hero.")) return "page";
    if (id.startsWith("home.openCase") || id === "home.openCase") return "page-work";
    if (id.startsWith("home.")) return "page-offer";
    if (id.startsWith("askRdw.") || id.startsWith("quote.") || id.startsWith("workflow.") || id.startsWith("commandK.")) {
      return "popups";
    }
    return "page";
  }
  const p = selection.path;
  if (p.startsWith("popups.")) return "popups";
  if (p === "site.name") return "header";
  if (
    p.startsWith("site.phone") ||
    p.startsWith("site.email") ||
    p.startsWith("site.address") ||
    p === "site.hours" ||
    p === "footerCopy.colStudio"
  ) {
    return "footer-studio";
  }
  if (p === "site.copyright") return "footer-legal";
  if (p === "site.footerBlurb" || p === "site.parent" || p.startsWith("footerCopy.")) return "footer-company";
  if (
    p.startsWith("homeSections.offer") ||
    p === "homeSections.scrollCue" ||
    p === "homeSections.unpack" ||
    p === "homeSections.offerMobileEyebrow"
  ) {
    return "page-offer";
  }
  if (p.startsWith("homeSections.desk")) return "page-desk";
  if (p.startsWith("homeSections.work") || (p.startsWith("project.") && pathOf(pathname) === "/")) return "page-work";
  if (p.startsWith("homeSections.process") || /^process\.\d+/.test(p)) return "page-process";
  if (p.startsWith("homeSections.faq") || /^faq\.\d+/.test(p)) return "page-faq";
  if (p.startsWith("svc.") && pathOf(pathname) === "/") return "page-offer";
  return "page";
}

export function buildInspectorGroups(
  pathname: string,
  draft: Content,
  pageLabel: string,
  selection: InspectorSelection | null,
): InspectorGroup[] {
  const groups: InspectorGroup[] = [
    {
      id: "page",
      title: `This page · ${pageLabel}`,
      items: pageCoreItems(pathname, draft),
    },
    ...extraPageGroups(pathname, draft),
    {
      id: "header",
      title: "Header / Nav",
      items: headerItems(draft),
    },
    {
      id: "footer-studio",
      title: "Footer · Studio",
      items: [
        textItem("footerCopy.colStudio", "Studio heading"),
        linkItem("footer.phone", "Studio phone"),
        linkItem("footer.email", "Studio email"),
        textItem("site.address.0", "Studio address line 1"),
        textItem("site.address.1", "Studio address line 2"),
        textItem("site.address.2", "Studio address line 3"),
        textItem("site.hours", "Studio hours"),
      ],
    },
    {
      id: "footer-company",
      title: "Footer · Company",
      items: [
        textItem("footerCopy.colCompany", "Company heading"),
        textItem("site.footerBlurb", "Studio description"),
        textItem("site.parent", "Parent company"),
        textItem("footerCopy.colBuild", "Build heading"),
        textItem("footerCopy.colGrow", "Grow heading"),
        textItem("footerCopy.colCreate", "Create heading"),
        textItem("footerCopy.colSupport", "Support heading"),
        linkItem("footer.about", "About"),
        linkItem("footer.work", "Work"),
        linkItem("footer.pricing", "Pricing"),
        linkItem("footer.contact", "Contact"),
      ],
    },
    {
      id: "footer-legal",
      title: "Footer · Legal bar",
      items: [
        textItem("site.copyright", "Copyright"),
        linkItem("footer.privacy", "Privacy Policy"),
        linkItem("footer.terms", "Terms"),
        linkItem("footer.modernSlavery", "Modern Slavery Policy"),
      ],
    },
    {
      id: "popups",
      title: "Pop-ups",
      items: [
        { id: "popup:askRdw", kind: "popup", popupId: "askRdw", label: "Ask RDW" },
        { id: "popup:brief", kind: "popup", popupId: "brief", label: "Start a brief" },
        { id: "popup:quote", kind: "popup", popupId: "quote", label: "Quote builder" },
        { id: "popup:commandK", kind: "popup", popupId: "commandK", label: "Jump to page" },
        { id: "popup:workflow", kind: "popup", popupId: "workflow", label: "Workflow play" },
        { id: "popup:mobileMenu", kind: "popup", popupId: "mobileMenu", label: "Mobile menu" },
      ],
    },
    {
      id: "seo",
      title: "SEO",
      items: [{ id: "seo", kind: "seo", label: "Search appearance" }],
    },
  ];

  if (!selection) return groups.filter((group) => group.items.length > 0);
  const groupId = groupIdForSelection(selection, pathname);
  const extra = itemFromSelection(selection);
  return groups
    .map((group) => {
      if (group.id !== groupId) return group;
      if (group.items.some((item) => item.id === extra.id)) return group;
      return { ...group, items: [...group.items, extra] };
    })
    .filter((group) => group.items.length > 0);
}
