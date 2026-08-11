export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-5 flex items-center justify-center gap-3 text-[13px]">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-sm border border-border px-3 py-1.5 text-textMuted disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Previous
      </button>
      <div className="text-textMuted">
        Page {page} of {totalPages}
      </div>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-sm border border-border px-3 py-1.5 text-textMuted disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
