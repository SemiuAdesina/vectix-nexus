import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  announceToScreenReader,
  trapFocus,
  generateUniqueId,
  getContrastRatio,
  meetsContrastRequirement,
  a11yProps,
  ARIA_LIVE_REGIONS,
  FOCUS_VISIBLE_STYLES,
  WCAG_COLORS,
} from './accessibility';

describe('accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('announceToScreenReader', () => {
    it('creates announcer element if it does not exist', () => {
      announceToScreenReader('Test message');
      const announcer = document.getElementById('sr-announcer');
      expect(announcer).toBeTruthy();
      expect(announcer?.getAttribute('role')).toBe('status');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });

    it('uses existing announcer element if it exists', () => {
      const existing = document.createElement('div');
      existing.id = 'sr-announcer';
      document.body.appendChild(existing);

      announceToScreenReader('Test message');
      const announcers = document.querySelectorAll('#sr-announcer');
      expect(announcers.length).toBe(1);
    });

    it('sets aria-live to assertive when specified', () => {
      announceToScreenReader('Test message', 'assertive');
      const announcer = document.getElementById('sr-announcer');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });

    it('updates text content after timeout', async () => {
      vi.useFakeTimers();
      announceToScreenReader('Test message');
      expect(document.getElementById('sr-announcer')?.textContent).toBe('');
      vi.advanceTimersByTime(100);
      await Promise.resolve();
      expect(document.getElementById('sr-announcer')?.textContent).toBe('Test message');
      vi.useRealTimers();
    });
  });

  describe('trapFocus', () => {
    it('traps focus within container', () => {
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const button3 = document.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);
      expect(document.activeElement).toBe(button1);
      cleanup();
    });

    it('cycles focus from last to first on Tab', () => {
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);

      trapFocus(container);
      button2.focus();
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      container.dispatchEvent(tabEvent);
      expect(document.activeElement).toBe(button1);
    });

    it('cycles focus from first to last on Shift+Tab', () => {
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);

      trapFocus(container);
      button1.focus();
      const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
      container.dispatchEvent(shiftTabEvent);
      expect(document.activeElement).toBe(button2);
    });

    it('removes event listener on cleanup', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      container.appendChild(button);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);
      cleanup();
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      container.dispatchEvent(tabEvent);
      expect(document.activeElement).toBe(button);
    });
  });

  describe('generateUniqueId', () => {
    it('generates unique IDs with prefix', () => {
      const id1 = generateUniqueId('test');
      const id2 = generateUniqueId('test');
      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^test-/);
      expect(id1).not.toBe(id2);
    });

    it('generates different IDs for different prefixes', () => {
      const id1 = generateUniqueId('prefix1');
      const id2 = generateUniqueId('prefix2');
      expect(id1).toMatch(/^prefix1-/);
      expect(id2).toMatch(/^prefix2-/);
    });
  });

  describe('getContrastRatio', () => {
    it('calculates contrast ratio for black on white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeGreaterThan(20);
    });

    it('calculates contrast ratio for white on black', () => {
      const ratio = getContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeGreaterThan(20);
    });

    it('calculates lower contrast for similar colors', () => {
      const ratio = getContrastRatio('#cccccc', '#dddddd');
      expect(ratio).toBeLessThan(2);
    });

    it('handles hex colors without #', () => {
      const ratio = getContrastRatio('000000', 'ffffff');
      expect(ratio).toBeGreaterThan(20);
    });
  });

  describe('meetsContrastRequirement', () => {
    it('returns true for high contrast colors (AA)', () => {
      expect(meetsContrastRequirement('#000000', '#ffffff', 'AA')).toBe(true);
    });

    it('returns true for high contrast colors (AAA)', () => {
      expect(meetsContrastRequirement('#000000', '#ffffff', 'AAA')).toBe(true);
    });

    it('returns false for low contrast colors (AA)', () => {
      expect(meetsContrastRequirement('#cccccc', '#dddddd', 'AA')).toBe(false);
    });

    it('uses lower threshold for large text', () => {
      const ratio = getContrastRatio('#444444', '#aaaaaa');
      const largeText = meetsContrastRequirement('#444444', '#aaaaaa', 'AA', true);
      const normalText = meetsContrastRequirement('#444444', '#aaaaaa', 'AA', false);
      expect(ratio).toBeGreaterThan(3);
      expect(ratio).toBeLessThan(4.5);
      expect(largeText).toBe(true);
      expect(normalText).toBe(false);
    });
  });

  describe('a11yProps', () => {
    it('generates button props', () => {
      const props = a11yProps.button('Click me');
      expect(props.role).toBe('button');
      expect(props['aria-label']).toBe('Click me');
      expect(props.tabIndex).toBe(0);
    });

    it('includes aria-pressed for button when specified', () => {
      const props = a11yProps.button('Click me', true);
      expect(props['aria-pressed']).toBe(true);
    });

    it('generates dialog props', () => {
      const props = a11yProps.dialog('Dialog Title', 'description-id');
      expect(props.role).toBe('dialog');
      expect(props['aria-modal']).toBe(true);
      expect(props['aria-labelledby']).toBe('Dialog Title');
      expect(props['aria-describedby']).toBe('description-id');
    });

    it('generates progress bar props', () => {
      const props = a11yProps.progressBar(50, 100, 'Loading');
      expect(props.role).toBe('progressbar');
      expect(props['aria-valuenow']).toBe(50);
      expect(props['aria-valuemin']).toBe(0);
      expect(props['aria-valuemax']).toBe(100);
      expect(props['aria-label']).toBe('Loading');
    });

    it('generates alert props', () => {
      const props = a11yProps.alert();
      expect(props.role).toBe('alert');
      expect(props['aria-live']).toBe('assertive');
      expect(props['aria-atomic']).toBe(true);
    });

    it('generates status props', () => {
      const props = a11yProps.status();
      expect(props.role).toBe('status');
      expect(props['aria-live']).toBe('polite');
      expect(props['aria-atomic']).toBe(true);
    });

    it('generates tab props', () => {
      const props = a11yProps.tab(true, 'panel-1');
      expect(props.role).toBe('tab');
      expect(props['aria-selected']).toBe(true);
      expect(props['aria-controls']).toBe('panel-1');
      expect(props.tabIndex).toBe(0);
    });

    it('generates tab panel props', () => {
      const props = a11yProps.tabPanel('tab-1', false);
      expect(props.role).toBe('tabpanel');
      expect(props['aria-labelledby']).toBe('tab-1');
      expect(props.hidden).toBe(false);
    });

    it('generates combobox props', () => {
      const props = a11yProps.combobox(true, 'list-1');
      expect(props.role).toBe('combobox');
      expect(props['aria-expanded']).toBe(true);
      expect(props['aria-controls']).toBe('list-1');
    });
  });

  describe('constants', () => {
    it('exports ARIA_LIVE_REGIONS', () => {
      expect(ARIA_LIVE_REGIONS.POLITE).toBe('polite');
      expect(ARIA_LIVE_REGIONS.ASSERTIVE).toBe('assertive');
      expect(ARIA_LIVE_REGIONS.OFF).toBe('off');
    });

    it('exports FOCUS_VISIBLE_STYLES', () => {
      expect(FOCUS_VISIBLE_STYLES).toContain('outline');
    });

    it('exports WCAG_COLORS', () => {
      expect(WCAG_COLORS.textPrimary).toBe('#1a1a1a');
      expect(WCAG_COLORS.primary).toBe('#0066cc');
      expect(WCAG_COLORS.error).toBe('#cc0000');
    });
  });
});
