import clsx from 'clsx';

export type SelectProps = React.HTMLAttributes<HTMLSelectElement> & {
  className?: string;
  label?: string;
  error?: string;
  [key: string]: any;
};

export function Select({
  label,
  error,
  required,
  className,
  ...rest
}: SelectProps) {
  return (
    <label className="flex flex-col gap-2">
      {label && (
        <div className="text-sm text-neutral-8">
          {label}
          {required && <span className="text-error">*</span>}
        </div>
      )}
      <select
        required={required}
        className="rounded border-neutral-80 py-3 focus:border-brand focus:ring-0 invalid:border-error invalid:ring-0"
        {...rest}
      />
      {error && <p className="ml-3 text-xs text-error">{error}</p>}
    </label>
  );
}
