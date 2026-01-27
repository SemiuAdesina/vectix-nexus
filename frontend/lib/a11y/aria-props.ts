export const a11yProps = {
  button: (label: string, isPressed?: boolean) => ({
    role: 'button',
    'aria-label': label,
    ...(isPressed !== undefined && { 'aria-pressed': isPressed }),
    tabIndex: 0,
  }),

  dialog: (title: string, describedBy?: string) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': title,
    ...(describedBy && { 'aria-describedby': describedBy }),
  }),

  progressBar: (value: number, max = 100, label?: string) => ({
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    ...(label && { 'aria-label': label }),
  }),

  alert: () => ({
    role: 'alert',
    'aria-live': 'assertive' as const,
    'aria-atomic': true,
  }),

  status: () => ({
    role: 'status',
    'aria-live': 'polite' as const,
    'aria-atomic': true,
  }),

  tabList: () => ({ role: 'tablist' }),

  tab: (selected: boolean, controls: string) => ({
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': controls,
    tabIndex: selected ? 0 : -1,
  }),

  tabPanel: (labelledBy: string, hidden: boolean) => ({
    role: 'tabpanel',
    'aria-labelledby': labelledBy,
    hidden,
    tabIndex: 0,
  }),

  combobox: (expanded: boolean, controls: string) => ({
    role: 'combobox',
    'aria-expanded': expanded,
    'aria-controls': controls,
    'aria-haspopup': 'listbox' as const,
  }),

  option: (selected: boolean) => ({
    role: 'option',
    'aria-selected': selected,
  }),
};
