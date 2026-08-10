import type { ComponentProps, ReactNode } from "react";

const CONTROL =
  "w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm text-ink backdrop-blur-md " +
  "placeholder:text-ink-faint focus:border-glow focus:outline-none focus:ring-1 " +
  "focus:ring-glow disabled:opacity-50";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-ink"
    >
      {children}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={`${CONTROL} ${className ?? ""}`.trim()} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea className={`${CONTROL} ${className ?? ""}`.trim()} rows={4} {...props} />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={`${CONTROL} ${className ?? ""}`.trim()} {...props} />;
}

/** Form alanı altındaki hata mesajı. */
export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">{children}</p>
  );
}

/** Form üstündeki genel hata kutusu. */
export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-inset ring-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-900"
    >
      {children}
    </div>
  );
}

/** Form üstündeki başarı kutusu. */
export function FormSuccess({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="status"
      className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900"
    >
      {children}
    </div>
  );
}
