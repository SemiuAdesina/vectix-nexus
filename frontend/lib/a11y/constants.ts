export const ARIA_LIVE_REGIONS = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off',
} as const;

export const FOCUS_VISIBLE_STYLES = `
  outline: 2px solid currentColor;
  outline-offset: 2px;
`;

export const WCAG_COLORS = {
  textPrimary: '#1a1a1a',
  textSecondary: '#4a4a4a',
  background: '#ffffff',
  backgroundAlt: '#f5f5f5',
  primary: '#0066cc',
  primaryHover: '#004d99',
  error: '#cc0000',
  errorBackground: '#fff0f0',
  success: '#006600',
  successBackground: '#f0fff0',
  warning: '#996600',
  warningBackground: '#fff8e6',
  focus: '#0066cc',
  border: '#666666',
} as const;
