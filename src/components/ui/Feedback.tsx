import type { ReactNode } from "react";

/** Yükleniyor göstergesi. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Yükleniyor"
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
    <div className="rounded-xl border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-neutral-700">
      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
        {title}
      </p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
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
      className={`overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${className ?? ""}`.trim()}
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
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
