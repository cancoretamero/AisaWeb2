'use client';

import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

type AisaLogoProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  imgClassName?: string;
};

export default function AisaLogo({ className, imgClassName, ...props }: AisaLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span className={className} {...props}>
        AISA
      </span>
    );
  }

  return (
    <span className={className} {...props}>
      <img
        src="/brand/aisa-logo.svg"
        alt="AISA"
        className={imgClassName}
        onError={() => setHasError(true)}
      />
    </span>
  );
}
