import { TYPOGRAPHY_PRESETS } from '@/lib/typography';
import { cn } from '@/lib/utils';
import type React from 'react';

interface TypographyProps {
  variant: keyof typeof TYPOGRAPHY_PRESETS;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className,
  as: Component = 'div',
}) => {
  return <Component className={cn(TYPOGRAPHY_PRESETS[variant], className)}>{children}</Component>;
};

// Specific typography components for common use cases
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h1" as="h1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h2" as="h2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h3" as="h3" {...props} />
);

export const Heading4: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h4" as="h4" {...props} />
);

export const Heading5: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h5" as="h5" {...props} />
);

export const Heading6: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h6" as="h6" {...props} />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="body" as="p" {...props} />
);

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="bodyLarge" as="p" {...props} />
);

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="bodySmall" as="p" {...props} />
);

export const Label: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="label" as="label" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="caption" as="span" {...props} />
);

export const BrandText: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="brand" as="span" {...props} />
);

export const LuxuryText: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="luxury" as="span" {...props} />
);
