import type { ReactNode } from "react";

/** Yükleniyor göstergesi. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className ?? ""}`.trim()}
    />
  );
}

/** Liste boşken gösterilecek kutu. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 px-6 py-12 text-center backdrop-blur-md">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Kart kabuğu. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass-card overflow-hidden rounded-2xl ${className ?? ""}`.trim()}
    >
      {children}
    </div>
  );
}

/** Sayfa başlığı bloğu. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
