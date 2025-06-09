// Typography utility functions and constants

export const FONT_FAMILIES = {
  primary: 'var(--font-primary)', // Inter - for body text, forms, UI elements
  display: 'var(--font-display)', // Playfair Display - for headings, luxury text
  accent: 'var(--font-accent)', // Poppins - for navigation, buttons, labels
} as const;

export const FONT_SIZES = {
  xs: 'var(--text-xs)', // 12px
  sm: 'var(--text-sm)', // 14px
  base: 'var(--text-base)', // 16px
  lg: 'var(--text-lg)', // 18px
  xl: 'var(--text-xl)', // 20px
  '2xl': 'var(--text-2xl)', // 24px
  '3xl': 'var(--text-3xl)', // 30px
  '4xl': 'var(--text-4xl)', // 36px
  '5xl': 'var(--text-5xl)', // 48px
  '6xl': 'var(--text-6xl)', // 60px
} as const;

export const FONT_WEIGHTS = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export const LINE_HEIGHTS = {
  tight: 'var(--leading-tight)', // 1.25
  snug: 'var(--leading-snug)', // 1.375
  normal: 'var(--leading-normal)', // 1.5
  relaxed: 'var(--leading-relaxed)', // 1.625
  loose: 'var(--leading-loose)', // 2
} as const;

export const LETTER_SPACING = {
  tighter: 'var(--tracking-tighter)', // -0.05em
  tight: 'var(--tracking-tight)', // -0.025em
  normal: 'var(--tracking-normal)', // 0em
  wide: 'var(--tracking-wide)', // 0.025em
  wider: 'var(--tracking-wider)', // 0.05em
  widest: 'var(--tracking-widest)', // 0.1em
} as const;

// Typography preset classes
export const TYPOGRAPHY_PRESETS = {
  // Headings
  h1: 'font-display text-5xl font-bold leading-tight tracking-tight text-black-gold',
  h2: 'font-display text-4xl font-semibold leading-tight tracking-tight text-black-gold',
  h3: 'text-accent text-3xl font-semibold leading-snug text-black-gold',
  h4: 'text-accent text-2xl font-semibold leading-snug text-black-gold',
  h5: 'text-accent text-xl font-medium leading-snug text-black-gold',
  h6: 'text-accent text-lg font-medium leading-normal tracking-wide text-black-gold',

  // Body text
  bodyLarge: 'text-primary text-lg font-normal leading-relaxed',
  body: 'text-primary text-base font-normal leading-relaxed',
  bodySmall: 'text-primary text-sm font-normal leading-normal',

  // Navigation
  navLink: 'text-accent text-base font-medium leading-normal nav-link',

  // Buttons
  buttonLarge: 'text-accent text-lg font-semibold leading-normal tracking-wide btn-text',
  button: 'text-accent text-base font-semibold leading-normal tracking-wide btn-text',
  buttonSmall: 'text-accent text-sm font-medium leading-normal tracking-wide btn-text-sm',

  // Labels and captions
  label: 'text-accent text-sm font-medium leading-normal tracking-wide uppercase label-text',
  caption: 'text-primary text-xs font-normal leading-normal caption',

  // Brand and luxury
  brand: 'font-display font-bold tracking-tight brand-text',
  luxury: 'font-display italic tracking-wide luxury-text',
} as const;

// Utility function to combine typography classes
export const createTypographyClass = (
  family: keyof typeof FONT_FAMILIES,
  size: keyof typeof FONT_SIZES,
  weight: keyof typeof FONT_WEIGHTS,
  options?: {
    lineHeight?: keyof typeof LINE_HEIGHTS;
    letterSpacing?: keyof typeof LETTER_SPACING;
    color?: string;
  }
): string => {
  const classes = [`font-${family}`, `text-${size}`, `font-${weight}`];

  if (options?.lineHeight) {
    classes.push(`leading-${options.lineHeight}`);
  }

  if (options?.letterSpacing) {
    classes.push(`tracking-${options.letterSpacing}`);
  }

  if (options?.color) {
    classes.push(`text-${options.color}`);
  }

  return classes.join(' ');
};

// Responsive typography utilities
export const RESPONSIVE_TYPOGRAPHY = {
  // Mobile-first responsive headings
  h1Responsive: 'text-3xl md:text-4xl lg:text-5xl',
  h2Responsive: 'text-2xl md:text-3xl lg:text-4xl',
  h3Responsive: 'text-xl md:text-2xl lg:text-3xl',
  h4Responsive: 'text-lg md:text-xl lg:text-2xl',

  // Responsive body text
  bodyResponsive: 'text-sm md:text-base',
  bodyLargeResponsive: 'text-base md:text-lg',
} as const;
