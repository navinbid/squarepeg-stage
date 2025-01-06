import { useState } from 'react';
import clsx from 'clsx';
import InputMask from 'react-input-mask';

import { IconEyeHide, IconEyeShow } from './Icon';

export type InputProps = React.HTMLAttributes<HTMLInputElement> & {
  className?: string;
  type?: string;
  variant?: 'search' | 'minisearch' | 'primary';
  [key: string]: any;
};

export function Input({
  className = '',
  type = 'text',
  variant = 'primary',
  error,
  ...props
}: InputProps) {
  const variants = {
    primary: clsx(
      'rounded border-neutral-80 py-3 focus:border-brand focus:ring-0 w-full',
      error && '!ring-error !ring-inset !ring-1',
    ),
    search:
      'bg-transparent px-0 py-2 text-heading w-full focus:ring-0 border-x-0 border-t-0 transition border-b-2 border-primary/10 focus:border-primary/90',
    minisearch:
      'bg-transparent hidden md:inline-block text-left lg:text-right border-b transition border-transparent -mb-px border-x-0 border-t-0 appearance-none px-0 py-1 focus:ring-transparent placeholder:opacity-20 placeholder:text-inherit',
  };

  const styles = clsx(variants[variant], className);
  if (type === 'password') {
    return <InputPassword {...props} className={styles} />;
  }
  return <input type={type} {...props} className={styles} />;
}

export type TextFieldProps = InputProps & {
  label?: string;
  error?: string;
};

export function InputPassword(props) {
  const [type, setType] = useState('password');
  return (
    <div className="relative">
      <input type={type} {...props} />
      <button
        onClick={() => setType(type === 'password' ? 'text' : 'password')}
        type="button"
        className="absolute top-0 right-0 bottom-0 flex items-center px-3"
      >
        {type === 'password' ? <IconEyeHide /> : <IconEyeShow />}
      </button>
    </div>
  );
}

export function TextField({
  label,
  error,
  required,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2 relative">
      {label && (
        <div className="text-sm text-neutral-8">
          {label}
          {required && <span>*</span>}
        </div>
      )}
      <Input required={required} error={error} {...rest} />
      {error && (
        <p className="absolute -bottom-5 left-0 text-xs text-error">{error}</p>
      )}
    </label>
  );
}

export function TextFieldMask({
  label,
  error,
  required,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2 relative">
      {label && (
        <div className="text-sm text-neutral-8">
          {label}
          {required && <span>*</span>}
        </div>
      )}
      <InputMask
        className={clsx(
          'rounded border-neutral-80 py-3 focus:border-brand focus:ring-0 w-full',
          error && 'border-error border ring-0',
        )}
        required={required}
        error={error}
        {...rest}
      />
      {error && (
        <p className="absolute -bottom-5 left-0 text-xs text-error">{error}</p>
      )}
    </label>
  );
}

export type TextAreaProps = React.HTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
  [key: string]: any;
};

export function TextArea({
  label,
  error,
  required,
  className,
  variant = 'primary',
  ...rest
}: TextAreaProps) {
  const variants = {
    primary:
      'rounded border-neutral-80 py-3 focus:border-brand focus:ring-0 invalid:border-error invalid:ring-0',
  };
  const styles = clsx(variants[variant], className);
  return (
    <label className="flex flex-col gap-2">
      {label && (
        <div className="text-sm text-neutral-8">
          {label}
          {required && <span >*</span>}
        </div>
      )}
      <textarea required={required} {...rest} className={styles}></textarea>
      {error && <p className="ml-3 text-xs text-error">{error}</p>}
    </label>
  );
}
