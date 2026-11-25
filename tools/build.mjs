// Generates the animated SVG panels used by README.md.
// Run: node tools/build.mjs  (writes into ../assets)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

const W = 1000;
const C = {
  bg: "#0b1020",
  panel: "#0f1630",
  bar: "#141d3d",
  border: "#25305a",
  text: "#e6edf3",
  muted: "#8b95b5",
  dim: "#5b6488",
  cyan: "#22d3ee",
  violet: "#a78bfa",
  green: "#4ade80",
  pink: "#f472b6",
  amber: "#fbbf24",
  orange: "#fb923c",
};
const FONT = `'JetBrains Mono','Fira Code','Cascadia Code',Consolas,'Courier New',monospace`;
const CHAR = 0.6; // approximate monospace advance per font-size unit

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let uid = 0;
const id = (p) => `${p}${++uid}`;

const baseStyle = `
  text{font-family:${FONT}}
  .f{opacity:0;animation:fade .7s ease forwards}
  .blink{animation:blink 1s steps(1) infinite}
  .pulse{animation:pulse 2.4s ease-in-out infinite}
  .float{animation:float 6s ease-in-out infinite}
  @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes blink{50%{opacity:0}}
  @keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @media (prefers-reduced-motion:reduce){.f,.blink,.pulse,.float{animation:none;opacity:1}}
`;

const svg = (h, body, extraDefs = "", extraStyle = "") => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}">
<defs>
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.cyan}"/><stop offset=".5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.pink}"/>
  </linearGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/>
  </linearGradient>
  ${extraDefs}
</defs>
<style>${baseStyle}${extraStyle}</style>
${body}
</svg>
`;

/** Editor/terminal window chrome with an animated light sweeping the top edge. */
const frame = (h, tab, inner) => `
<rect x="1" y="1" width="${W - 2}" height="${h - 2}" rx="14" fill="${C.panel}" stroke="${C.border}"/>
<path d="M1 15a14 14 0 0 1 14-14h${W - 30}a14 14 0 0 1 14 14v25H1z" fill="${C.bar}"/>
<circle cx="24" cy="21" r="6" fill="#ff5f57"/><circle cx="44" cy="21" r="6" fill="#febc2e"/><circle cx="64" cy="21" r="6" fill="#28c840"/>
<text x="${W / 2}" y="26" text-anchor="middle" font-size="13" fill="${C.muted}">${esc(tab)}</text>
<rect x="-200" y="39" width="200" height="2" fill="url(#edge)">
  <animate attributeName="x" from="-200" to="${W}" dur="4s" repeatCount="indefinite"/>
</rect>
${inner}`;

/** Text revealed character by character (SMIL clip, works inside <img>). */
const typed = (x, y, text, { size = 16, fill = C.text, begin = 0, cps = 22, weight = 400 } = {}) => {
  const clip = id("t");
  const n = text.length;
  const full = Math.ceil(n * size * CHAR) + 12;
  const widths = Array.from({ length: n + 1 }, (_, i) => (i === n ? full : Math.round(i * size * CHAR)));
  const dur = Math.max(n / cps, 0.2).toFixed(2);
  return `<clipPath id="${clip}"><rect x="${x - 2}" y="${y - size - 4}" width="0" height="${size + 12}">
  <animate attributeName="width" values="${widths.join(";")}" calcMode="discrete" begin="${begin}s" dur="${dur}s" fill="freeze"/>
</rect></clipPath>
<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" clip-path="url(#${clip})">${esc(text)}</text>`;
};
const typedEnd = (text, begin, cps = 22) => begin + text.length / cps;

const fade = (delay, inner) => `<g class="f" style="animation-delay:${delay.toFixed(2)}s">${inner}</g>`;

const write = (name, content) => {
  writeFileSync(join(OUT, name), content);
  console.log("wrote assets/" + name);
};

// ---------- header ----------
{
  const H = 330;
  let t = 0.4;
  const lines = [];
  const prompt = (y, cmd) => {
    lines.push(`<text x="40" y="${y}" font-size="16" fill="${C.green}">➜</text><text x="64" y="${y}" font-size="16" fill="${C.cyan}">~</text>`);
    lines.push(typed(84, y, cmd, { begin: t, fill: C.text }));
    t = typedEnd(cmd, t) + 0.3;
  };
  prompt(82, "whoami");
  lines.push(fade(t, `<text x="40" y="126" font-size="38" font-weight="700" fill="url(#brand)">James Guevara Gamboa</text>`));
  t += 0.6;
  prompt(170, "cat role.txt");
  lines.push(fade(t, `<text x="40" y="202" font-size="22" fill="${C.text}">Frontend &amp; Full Stack Developer</text>`));
  t += 0.6;
  prompt(244, "echo $STACK");
  lines.push(fade(t, `<text x="40" y="274" font-size="15" fill="${C.muted}">Next.js · React · TypeScript · Node.js · Shopify · WordPress · Strapi</text>`));
  t += 0.6;
  lines.push(fade(t, `<text x="40" y="310" font-size="16" fill="${C.green}">➜</text><text x="64" y="310" font-size="16" fill="${C.cyan}">~</text><rect class="blink" x="86" y="296" width="10" height="18" fill="${C.text}"/>`));

  const deco = `
<g class="float" style="transform-box:fill-box">
  <text x="850" y="190" text-anchor="middle" font-size="120" font-weight="700" fill="url(#brand)" opacity=".9">{ }</text>
</g>
<text x="850" y="250" text-anchor="middle" font-size="13" fill="${C.muted}" class="pulse">Heredia, Costa Rica</text>
<text x="850" y="272" text-anchor="middle" font-size="13" fill="${C.cyan}">open to remote · worldwide</text>
${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${740 + i * 44}" cy="${70 + (i % 2) * 20}" r="2.5" fill="${[C.cyan, C.violet, C.pink][i % 3]}" class="pulse" style="animation-delay:${i * 0.4}s"/>`).join("")}`;

  write("header.svg", svg(H, frame(H, "~/james — zsh", lines.join("\n") + deco)));
}

// ---------- link buttons ----------
const button = (file, label, color) => {
  const w = 330;
  const h = 64;
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<style>text{font-family:${FONT}}</style>
<rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="12" fill="${C.panel}" stroke="${C.border}"/>
<rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="12" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="120 ${2 * (w + h) - 120}">
  <animate attributeName="stroke-dashoffset" from="0" to="-${2 * (w + h)}" dur="5s" repeatCount="indefinite"/>
</rect>
<text x="${w / 2}" y="${h / 2 + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="${C.text}" letter-spacing="2">${esc(label)}</text>
</svg>
`;
  write(file, content);
};
button("link-portfolio.svg", "↗ PORTFOLIO", C.cyan);
button("link-linkedin.svg", "in LINKEDIN", C.violet);
button("link-email.svg", "@ EMAIL", C.pink);

// ---------- about.ts ----------
{
  const k = (s) => `<tspan fill="${C.violet}">${esc(s)}</tspan>`;
  const p = (s) => `<tspan fill="${C.cyan}">${esc(s)}</tspan>`;
  const s = (v) => `<tspan fill="${C.green}">"${esc(v)}"</tspan>`;
  const d = (v) => `<tspan fill="${C.text}">${esc(v)}</tspan>`;
  const c = (v) => `<tspan fill="${C.dim}">${esc(v)}</tspan>`;
  const arr = (items) => d("[") + items.map(s).join(d(", ")) + d("]");
  const code = [
    k("const ") + p("james") + d(" = {"),
    "  " + p("role") + d(": ") + s("Frontend & Full Stack Developer") + d(","),
    "  " + p("location") + d(": ") + s("Heredia, Costa Rica") + d(","),
    "  " + p("openTo") + d(": ") + arr(["remote", "hybrid", "on-site"]) + d(","),
    "  " + p("focus") + d(": ") + arr(["Next.js", "headless CMS", "e-commerce", "performance"]) + d(","),
    "  " + p("languages") + d(": { ") + p("spanish") + d(": ") + s("native") + d(", ") + p("english") + d(": ") + s("B2") + d(" },"),
    "  " + p("currently") + d(": ") + s("freelancing: corporate & real estate sites") + d(","),
    d("};"),
    "",
    k("export default ") + p("james") + d(";") + c("  // let's build something together"),
  ];
  const top = 76;
  const lh = 28;
  const H = top + code.length * lh + 20;
  const body = code
    .map((line, i) => {
      const y = top + i * lh;
      return fade(0.3 + i * 0.18, `<text x="46" y="${y}" font-size="14" fill="${C.dim}" text-anchor="end">${i + 1}</text><text x="70" y="${y}" font-size="15" xml:space="preserve">${line}</text>`);
    })
    .join("\n");
  const cursorY = top + (code.length - 1) * lh;
  const cursor = fade(0.3 + code.length * 0.18, `<rect class="blink" x="${70 + 56 * 15 * CHAR}" y="${cursorY - 14}" width="9" height="18" fill="${C.cyan}"/>`);
  write("about.svg", svg(H, frame(H, "about.ts", body + cursor)));
}

// ---------- experience: git log ----------
{
  const jobs = [
    {
      hash: "8f3c2a1",
      branch: "HEAD → freelance",
      role: "Freelance Frontend Developer",
      org: "Self-employed · real clients",
      date: "Aug 2024 — present",
      color: C.cyan,
      bullets: [
        "Corporate, commercial and real estate websites for real clients",
        "Next.js + TypeScript + Strapi (headless CMS) + Tailwind CSS",
        "Dynamic content, performance optimization and SEO best practices",
        "Escazú Village · C3 Cariari · Plaza Tempo · Aleste · Avenida Escazú · Savia",
      ],
    },
    {
      hash: "5d91e07",
      role: "Front End & WordPress Developer",
      org: "TechPro Solutions",
      date: "Jan 2024 — Jul 2024",
      color: C.violet,
      bullets: [
        "Responsive WordPress sites with custom themes and plugins",
        "UI/UX design and implementation focused on usability",
        "Client collaboration, technical consulting, SEO and agile delivery",
      ],
    },
    {
      hash: "2b7a4c9",
      role: "Front End Developer",
      org: "ContraLuz · Remote",
      date: "Mar 2023 — Dec 2023",
      color: C.pink,
      bullets: [
        "Next.js + ISR landing page scoring 100% Lighthouse performance",
        "Led the migration to Shopify and launched the e-commerce platform",
        "Shopping cart, user tracking and an SSR admin panel for content",
      ],
    },
  ];
  let y = 80;
  const parts = [];
  const graphTop = y - 6;
  let delay = 0.3;
  for (const job of jobs) {
    const startY = y;
    parts.push(
      fade(
        delay,
        `<circle cx="56" cy="${y - 5}" r="8" fill="${C.panel}" stroke="${job.color}" stroke-width="3"/>
<circle cx="56" cy="${y - 5}" r="14" fill="none" stroke="${job.color}" stroke-width="1.5" class="pulse"/>
<text x="84" y="${y}" font-size="14" fill="${C.amber}">${job.hash}</text>` +
          (job.branch
            ? `<rect x="156" y="${y - 16}" width="${job.branch.length * 8.4 + 16}" height="22" rx="11" fill="none" stroke="${C.cyan}"/><text x="164" y="${y}" font-size="13" fill="${C.cyan}">${esc(job.branch)}</text>`
            : "") +
          `<text x="${W - 40}" y="${y}" text-anchor="end" font-size="14" fill="${C.muted}">${esc(job.date)}</text>
<text x="84" y="${y + 32}" font-size="20" font-weight="700" fill="${C.text}">${esc(job.role)}</text>
<text x="84" y="${y + 56}" font-size="14" fill="${job.color}">${esc(job.org)}</text>`
      )
    );
    y += 86;
    delay += 0.35;
    for (const b of job.bullets) {
      parts.push(fade(delay, `<text x="96" y="${y}" font-size="14" fill="${C.muted}"><tspan fill="${job.color}">+ </tspan>${esc(b)}</text>`));
      y += 26;
      delay += 0.12;
    }
    y += 34;
    void startY;
  }
  const graphBottom = y - 60;
  const line = `<line x1="56" y1="${graphTop}" x2="56" y2="${graphBottom}" stroke="${C.border}" stroke-width="3"/>
<line x1="56" y1="${graphTop}" x2="56" y2="${graphBottom}" stroke="url(#brand)" stroke-width="3" stroke-dasharray="14 10">
  <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="1.6s" repeatCount="indefinite"/>
</line>`;
  const H = y - 20;
  write("experience.svg", svg(H, frame(H, "git log --graph experience", line + parts.join("\n"))));
}

// ---------- education: npm ls ----------
{
  const rows = [
    { t: "@james/education@2025", c: C.text, b: true },
    { t: "├─┬ fwd-costa-rica", note: "Full Stack Web Developer · Jan — Jul 2025", c: C.cyan },
    { t: "├─┬ cetav-la-libertad", note: "Web Design & Development · 2,880 h · Jan 2024", c: C.violet },
    { t: "├─┬ ina", note: "Web Design & Development, technician level · 928 h · Jan 2024", c: C.violet },
    { t: "├─┬ anthropic-academy", note: "Anthropic · May 2026", c: C.orange },
    { t: "│ ├── claude-code-in-action", c: C.text },
    { t: "│ ├── claude-code-101", c: C.text },
    { t: "│ ├── building-with-the-claude-api", c: C.text },
    { t: "│ ├── introduction-to-model-context-protocol", c: C.text },
    { t: "│ ├── ai-fluency-framework-and-foundations", c: C.text },
    { t: "│ ├── claude-101", c: C.text },
    { t: "│ └── introduction-to-claude-cowork", c: C.text },
    { t: "└─┬ certifications", c: C.pink },
    { t: "  ├── n8n-and-ai-automation", note: "Raiola Networks · 2026", c: C.text },
    { t: "  ├── javascript-algorithms-and-data-structures", note: "300 h · 2023", c: C.text },
    { t: "  ├── introduction-to-cybersecurity", note: "2023", c: C.text },
    { t: "  ├── angular-12-dotnet-core-web-api-mysql", note: "2023", c: C.text },
    { t: "  ├── responsive-web-design", note: "300 h · 2022", c: C.text },
    { t: "  ├── universidad-html", note: "Udemy · 2021", c: C.text },
    { t: "  ├── intro-to-web-development-i-and-ii", note: "Google Actívate · 80 h · 2021", c: C.text },
    { t: "  ├── cybersecurity-essentials", note: "Cisco Networking Academy · 2020", c: C.text },
    { t: "  └── get-connected", note: "Cisco Networking Academy · 2020", c: C.text },
    { t: "" },
    { t: "★ achievement", note: "Human Brush (Belgium): animated the human figure in a projection", c: C.amber },
  ];
  const parts = [];
  let t = 0.4;
  parts.push(`<text x="40" y="76" font-size="16" fill="${C.green}">➜</text><text x="64" y="76" font-size="16" fill="${C.cyan}">~</text>`);
  const cmd = "npm ls @james/education";
  parts.push(typed(84, 76, cmd, { begin: t }));
  t = typedEnd(cmd, t) + 0.3;
  let y = 114;
  for (const r of rows) {
    if (r.t) {
      const note = r.note ? `<tspan fill="${C.muted}">  ${esc(r.note)}</tspan>` : "";
      parts.push(fade(t, `<text x="40" y="${y}" font-size="15" xml:space="preserve" fill="${r.c}" font-weight="${r.b ? 700 : 400}">${esc(r.t)}${note}</text>`));
      t += 0.15;
    }
    y += 28;
  }
  const H = y + 6;
  write("education.svg", svg(H, frame(H, "~/education — zsh", parts.join("\n"))));
}

// ---------- section title ----------
const sectionTitle = (file, cmd, comment) => {
  const H = 64;
  const body = `<text x="12" y="40" font-size="18" fill="${C.green}">➜</text><text x="36" y="40" font-size="18" fill="${C.cyan}">~</text>
${typed(60, 40, cmd, { size: 18, begin: 0.3 })}
${fade(typedEnd(cmd, 0.3) + 0.2, `<text x="${60 + (cmd.length + 2) * 18 * CHAR}" y="40" font-size="15" fill="${C.dim}">${esc(comment)}</text>`)}
<rect x="12" y="54" width="${W - 24}" height="1" fill="${C.border}"/>`;
  write(file, svg(H, body));
};
sectionTitle("title-projects.svg", "ls ~/projects", "// some things I've built");
sectionTitle("title-stack.svg", "cat package.json", "// tools I use every day");

// ---------- project cards ----------
const card = (file, p) => {
  const w = 500;
  const h = 210;
  const tags = [];
  let tx = 24;
  for (const tag of p.tags) {
    const tw = tag.length * 7.6 + 20;
    tags.push(`<rect x="${tx}" y="${h - 50}" width="${tw}" height="24" rx="12" fill="${C.bar}" stroke="${C.border}"/><text x="${tx + 10}" y="${h - 33}" font-size="12" fill="${p.color}">${esc(tag)}</text>`);
    tx += tw + 8;
  }
  const lines = p.desc.map((l, i) => `<text x="24" y="${100 + i * 22}" font-size="13.5" fill="${C.muted}">${esc(l)}</text>`).join("");
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.color}" stop-opacity="0"/><stop offset=".5" stop-color="${p.color}"/><stop offset="1" stop-color="${p.color}" stop-opacity="0"/></linearGradient></defs>
<style>text{font-family:${FONT}}.pulse{animation:pulse 2.4s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}@media (prefers-reduced-motion:reduce){.pulse{animation:none}}</style>
<rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="14" fill="${C.panel}" stroke="${C.border}"/>
<rect x="8" y="8" width="160" height="2" fill="url(#g)"><animate attributeName="x" values="8;${w - 168};8" dur="${p.speed}s" repeatCount="indefinite"/></rect>
<circle cx="32" cy="42" r="5" fill="${p.color}" class="pulse"/>
<text x="46" y="47" font-size="12" fill="${C.dim}">${esc(p.kind)}</text>
<text x="24" y="76" font-size="21" font-weight="700" fill="${C.text}">${esc(p.name)}</text>
${lines}
${tags.join("")}
</svg>
`;
  write(file, content);
};
card("project-1.svg", {
  name: "Avenida Escazú",
  kind: "client work · avenidaescazu.com",
  desc: ["Bilingual (ES/EN) site on the Next.js App Router,", "with all content managed in Strapi via GraphQL."],
  tags: ["Next.js", "GraphQL", "Apollo", "Strapi"],
  color: C.cyan,
  speed: 5,
});
card("project-2.svg", {
  name: "Savia",
  kind: "client work · savia.cr",
  desc: ["Bilingual site with about, impact, talent, blog and", "a contact form that stores leads in the CMS."],
  tags: ["Next.js", "Apollo", "Strapi", "Tailwind"],
  color: C.pink,
  speed: 5.5,
});
card("project-3.svg", {
  name: "Real Estate Portfolio",
  kind: "client work · real estate",
  desc: ["Website to browse and manage properties, with", "dynamic projects rendering, SEO and responsive UI."],
  tags: ["Next.js", "TypeScript", "Tailwind", "Strapi"],
  color: C.violet,
  speed: 6,
});
card("project-4.svg", {
  name: "Novus ERP",
  kind: "client work · enterprise",
  desc: ["Enterprise solution to manage and visualize", "corporate information. Scalable, fast, maintainable."],
  tags: ["Next.js", "TypeScript", "Tailwind", "Strapi"],
  color: C.amber,
  speed: 6.5,
});

// ---------- client work: one linked card per site ----------
const CLIENT_SITES = [
  ["Avenida Escazú", "avenidaescazu.com", "Next.js · Strapi · GraphQL"],
  ["Savia", "savia.cr", "Next.js · Strapi · GraphQL"],
  ["C3 Cariari", "c3.cr", "Next.js · Strapi · GraphQL"],
  ["Escazú Village", "escazuvillage.com", "Next.js · Strapi · GraphQL"],
  ["Plaza Tempo", "plazatempo.com", "Next.js · Strapi · GraphQL"],
  ["Al Este", "aleste.cr", "Next.js · Strapi · GraphQL"],
  ["Portafolio Inmobiliario", "portafolio.cr", "Next.js · Strapi · GraphQL"],
  ["Lincoln Plaza", "lincolnplaza.cr", "Next.js · Strapi · GraphQL"],
  ["Torre Universal", "torreuniversal.com", "Next.js · Strapi · GraphQL"],
  ["La Laguna", "lalaguna.cr", "Next.js · Strapi · GraphQL"],
  ["El Cedral", "centrocorporativoelcedral.com", "Next.js · React"],
  ["Hospital La Católica", "hilc.cr", "website"],
  ["Fresh Market", "freshmarket.co.cr", "WordPress · Elementor"],
  ["ContraLuz", "contraluz.cr", "Shopify · Liquid"],
  ["PolkaCR", "polkacr.com", "Shopify · Liquid"],
];
{
  const colors = [C.cyan, C.violet, C.pink, C.amber, C.green];
  const w = 333;
  const h = 96;
  CLIENT_SITES.forEach(([name, domain, stack], i) => {
    const c = colors[i % colors.length];
    const content = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<style>text{font-family:${FONT}}.pulse{animation:pulse 2.4s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}@media (prefers-reduced-motion:reduce){.pulse{animation:none}}</style>
<rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="12" fill="${C.panel}" stroke="${C.border}"/>
<rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="12" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="90 ${2 * (w + h)}">
  <animate attributeName="stroke-dashoffset" from="0" to="-${2 * (w + h)}" dur="${5 + (i % 4)}s" repeatCount="indefinite"/>
</rect>
<circle cx="24" cy="31" r="4" fill="${c}" class="pulse" style="animation-delay:${(i % 5) * 0.3}s"/>
<text x="36" y="36" font-size="15" font-weight="700" fill="${C.text}">${esc(name)}</text>
<text x="20" y="60" font-size="12.5" fill="${c}">↗ ${esc(domain)}</text>
<text x="20" y="80" font-size="11" fill="${C.muted}">${esc(stack)}</text>
</svg>
`;
    write(`site-${String(i + 1).padStart(2, "0")}.svg`, content);
  });
}
sectionTitle("title-clients.svg", "git remote -v", "// client sites I've shipped");

// ---------- stack ----------
{
  const groups = [
    { key: "frontend", color: C.cyan, items: ["React", "Next.js", "TypeScript", "JavaScript", "Astro", "Tailwind CSS", "Sass", "CSS Modules", "HTML5"] },
    { key: "backend", color: C.violet, items: ["Node.js", "Express", "GraphQL", "Apollo", "REST APIs", "Python"] },
    { key: "data", color: C.green, items: ["MongoDB", "MySQL", "SQL"] },
    { key: "cms & e-commerce", color: C.pink, items: ["Strapi", "Headless CMS", "WordPress", "Shopify", "Drupal"] },
    { key: "tools", color: C.amber, items: ["Git", "Docker", "Figma", "UI/UX", "SEO"] },
  ];
  const parts = [`<text x="40" y="76" font-size="15" fill="${C.text}">{</text>`, `<text x="64" y="104" font-size="15"><tspan fill="${C.cyan}">"dependencies"</tspan><tspan fill="${C.text}">: {</tspan></text>`];
  let y = 146;
  let t = 0.3;
  for (const g of groups) {
    parts.push(fade(t, `<text x="88" y="${y}" font-size="14" fill="${g.color}">"${esc(g.key)}"</text>`));
    let x = 290;
    let rowY = y;
    for (const item of g.items) {
      const w = item.length * 8 + 22;
      if (x + w > W - 40) {
        x = 290;
        rowY += 36;
      }
      parts.push(fade(t, `<rect x="${x}" y="${rowY - 19}" width="${w}" height="28" rx="8" fill="${C.bar}" stroke="${g.color}" stroke-opacity=".55"/><text x="${x + 11}" y="${rowY}" font-size="13.5" fill="${C.text}">${esc(item)}</text>`));
      x += w + 10;
      t += 0.06;
    }
    y = rowY + 50;
    t += 0.15;
  }
  parts.push(`<text x="64" y="${y - 10}" font-size="15" fill="${C.text}">}</text><text x="40" y="${y + 18}" font-size="15" fill="${C.text}">}</text>`);
  const H = y + 40;
  write("stack.svg", svg(H, frame(H, "package.json", parts.join("\n"))));
}

// ---------- footer ----------
{
  const H = 150;
  const wave = (amp, dur, color, op) => {
    const d1 = `M0 ${H - 40} Q 250 ${H - 40 - amp} 500 ${H - 40} T 1000 ${H - 40} V ${H} H 0 Z`;
    const d2 = `M0 ${H - 40} Q 250 ${H - 40 + amp} 500 ${H - 40} T 1000 ${H - 40} V ${H} H 0 Z`;
    return `<path d="${d1}" fill="${color}" opacity="${op}"><animate attributeName="d" values="${d1};${d2};${d1}" dur="${dur}s" repeatCount="indefinite"/></path>`;
  };
  const msg = "return <ThanksForVisiting />;";
  const body = `<rect width="${W}" height="${H}" rx="14" fill="${C.bg}"/>
${wave(26, 7, C.violet, 0.35)}${wave(18, 5, C.cyan, 0.3)}
${typed(W / 2 - (msg.length * 20 * CHAR) / 2, 52, msg, { size: 20, begin: 0.3, fill: C.text })}
${fade(typedEnd(msg, 0.3) + 0.2, `<text x="${W / 2}" y="84" text-anchor="middle" font-size="13" fill="${C.muted}">// open to new opportunities — let's build something together</text>`)}`;
  write("footer.svg", svg(H, body));
}
