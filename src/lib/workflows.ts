export type WorkflowId = "websites" | "apps" | "ai" | "motion";

export type WorkflowBeat = {
  label: string;
  line: string;
};

export type Workflow = {
  id: WorkflowId;
  n: string;
  title: string;
  from: string;
  promise: string;
  beats: WorkflowBeat[];
};

export const workflows: Workflow[] = [
  {
    id: "websites",
    n: "01",
    title: "Websites",
    from: "From £1,450",
    promise:
      "A site your team can run. Structure, design, build, search foundations, then live — not a PDF of what it might look like.",
    beats: [
      { label: "Brief", line: "Pages, tone, who it is for." },
      { label: "Structure", line: "The map, then clickable wires." },
      { label: "Build", line: "Design, CMS, forms, analytics." },
      { label: "Search", line: "Technical SEO so Google can actually read it." },
      { label: "Live", line: "Training, source, you own it." },
    ],
  },
  {
    id: "apps",
    n: "02",
    title: "Software",
    from: "Scoped",
    promise:
      "A portal or tool instead of WhatsApp and spreadsheets. Written scope, then weekly slices you can click.",
    beats: [
      { label: "Intake", line: "The jobs, files, and status that hurt today." },
      { label: "Scope", line: "Fixed writing: what ships, what it costs." },
      { label: "Slice", line: "A live link every week, not a big bang." },
      { label: "Roles", line: "Who sees what. You hold the keys." },
      { label: "Run", line: "Your team operates it. We stay on if you want." },
    ],
  },
  {
    id: "ai",
    n: "03",
    title: "AI desks",
    from: "From £900",
    promise:
      "One workflow that answers, books, and hands off. Not a chatbot dumped in the footer.",
    beats: [
      { label: "Enquiry", line: "The same question, fifty times a week." },
      { label: "Answer", line: "The desk replies with the real policy." },
      { label: "Book", line: "A slot in the diary, not another unread email." },
      { label: "Handoff", line: "A human gets the thread when it matters." },
      { label: "Loop", line: "If it saves hours, we add the next workflow." },
    ],
  },
  {
    id: "motion",
    n: "04",
    title: "Motion",
    from: "From £450",
    promise:
      "Renders, explainers, and film from the same Kennington floor that taught the craft. In-house, not a freelancer on Thursday.",
    beats: [
      { label: "Story", line: "What has to be understood in thirty seconds." },
      { label: "Make", line: "Maya, Unreal, Blender, After Effects — on site." },
      { label: "Review", line: "A playable cut, not a still for approval." },
      { label: "Master", line: "The file you can actually ship." },
      { label: "Place", line: "On the site, in the pitch, in the room." },
    ],
  },
];
