// Shared Tailwind utility string for rendering the transcribed rules-content
// HTML (glossary entries, FAQ sections) via dangerouslySetInnerHTML, since
// there's no typography plugin loaded in this project's Tailwind config.
export const RULES_PROSE_CLASSES =
  "[&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal " +
  "[&_ol]:pl-5 [&_li]:mb-1.5 [&_strong]:font-semibold [&_em]:italic [&_a]:text-accent [&_a:hover]:underline " +
  "[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-[15px] [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-bold " +
  "[&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:text-[13px] [&_h4]:font-semibold [&_blockquote]:mb-3 [&_blockquote]:border-l-2 " +
  "[&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-textMuted " +
  "[&_cite]:not-italic [&_hr]:my-4 [&_hr]:border-border [&_table]:mb-3 [&_table]:border-collapse " +
  "[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:border [&_td]:border-border " +
  "[&_td]:px-2 [&_td]:py-1 [&_[data-new]]:rounded-sm [&_[data-new]]:bg-accent/10 [&_[data-new]]:px-0.5 " +
  "[&_img]:mx-auto [&_img]:my-3 [&_img]:block [&_img]:max-w-full [&_img]:rounded";
