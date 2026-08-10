export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-3xl px-7 py-16 text-center">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm text-textMuted">Coming soon.</div>
    </div>
  );
}
