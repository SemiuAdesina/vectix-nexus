import { a11yProps } from './aria-props';

describe('a11yProps.button', () => {
  it('returns basic button props', () => {
    const props = a11yProps.button('Click me');
    expect(props.role).toBe('button');
    expect(props['aria-label']).toBe('Click me');
    expect(props.tabIndex).toBe(0);
  });

  it('includes aria-pressed when provided', () => {
    const props = a11yProps.button('Toggle', true);
    expect(props['aria-pressed']).toBe(true);
  });

  it('does not include aria-pressed when undefined', () => {
    const props = a11yProps.button('Click me');
    expect(props).not.toHaveProperty('aria-pressed');
  });
});

describe('a11yProps.dialog', () => {
  it('returns dialog props', () => {
    const props = a11yProps.dialog('dialog-title');
    expect(props.role).toBe('dialog');
    expect(props['aria-modal']).toBe(true);
    expect(props['aria-labelledby']).toBe('dialog-title');
  });

  it('includes describedBy when provided', () => {
    const props = a11yProps.dialog('title', 'description');
    expect(props['aria-describedby']).toBe('description');
  });
});

describe('a11yProps.progressBar', () => {
  it('returns progressbar props', () => {
    const props = a11yProps.progressBar(50);
    expect(props.role).toBe('progressbar');
    expect(props['aria-valuenow']).toBe(50);
    expect(props['aria-valuemin']).toBe(0);
    expect(props['aria-valuemax']).toBe(100);
  });

  it('respects custom max value', () => {
    const props = a11yProps.progressBar(25, 50);
    expect(props['aria-valuemax']).toBe(50);
  });

  it('includes label when provided', () => {
    const props = a11yProps.progressBar(75, 100, 'Loading progress');
    expect(props['aria-label']).toBe('Loading progress');
  });
});

describe('a11yProps.alert', () => {
  it('returns alert props', () => {
    const props = a11yProps.alert();
    expect(props.role).toBe('alert');
    expect(props['aria-live']).toBe('assertive');
    expect(props['aria-atomic']).toBe(true);
  });
});

describe('a11yProps.status', () => {
  it('returns status props', () => {
    const props = a11yProps.status();
    expect(props.role).toBe('status');
    expect(props['aria-live']).toBe('polite');
    expect(props['aria-atomic']).toBe(true);
  });
});

describe('a11yProps.tab', () => {
  it('returns tab props for selected tab', () => {
    const props = a11yProps.tab(true, 'panel-1');
    expect(props.role).toBe('tab');
    expect(props['aria-selected']).toBe(true);
    expect(props['aria-controls']).toBe('panel-1');
    expect(props.tabIndex).toBe(0);
  });

  it('returns tab props for unselected tab', () => {
    const props = a11yProps.tab(false, 'panel-2');
    expect(props['aria-selected']).toBe(false);
    expect(props.tabIndex).toBe(-1);
  });
});

describe('a11yProps.tabPanel', () => {
  it('returns tabpanel props', () => {
    const props = a11yProps.tabPanel('tab-1', false);
    expect(props.role).toBe('tabpanel');
    expect(props['aria-labelledby']).toBe('tab-1');
    expect(props.hidden).toBe(false);
    expect(props.tabIndex).toBe(0);
  });
});

describe('a11yProps.combobox', () => {
  it('returns combobox props', () => {
    const props = a11yProps.combobox(true, 'listbox-1');
    expect(props.role).toBe('combobox');
    expect(props['aria-expanded']).toBe(true);
    expect(props['aria-controls']).toBe('listbox-1');
    expect(props['aria-haspopup']).toBe('listbox');
  });
});

describe('a11yProps.option', () => {
  it('returns option props', () => {
    const props = a11yProps.option(true);
    expect(props.role).toBe('option');
    expect(props['aria-selected']).toBe(true);
  });
});
