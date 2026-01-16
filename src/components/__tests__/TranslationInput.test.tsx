import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TranslationInput from '../TranslationInput';

// Mock fetch
global.fetch = vi.fn();

describe('TranslationInput', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render input field and language selectors', () => {
    render(<TranslationInput />);

    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(screen.getByLabelText('Phrase to translate')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Translate' })).toBeInTheDocument();
  });

  it('should have correct default languages selected', () => {
    render(<TranslationInput />);

    const fromSelect = screen.getByLabelText('From') as HTMLSelectElement;
    const toSelect = screen.getByLabelText('To') as HTMLSelectElement;

    expect(fromSelect.value).toBe('en');
    expect(toSelect.value).toBe('es');
  });

  it('should update phrase when user types', async () => {
    const user = userEvent.setup();
    render(<TranslationInput />);

    const textarea = screen.getByLabelText('Phrase to translate');
    await user.type(textarea, 'Hello');

    expect(textarea).toHaveValue('Hello');
  });

  it('should show error when trying to translate empty phrase', async () => {
    const user = userEvent.setup();
    render(<TranslationInput />);

    const translateButton = screen.getByRole('button', { name: 'Translate' });
    await user.click(translateButton);

    expect(screen.getByText('Please enter a phrase to translate')).toBeInTheDocument();
  });

  it('should call translate API and show result', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ translation: 'Hola' }),
    });

    const user = userEvent.setup();
    render(<TranslationInput />);

    const textarea = screen.getByLabelText('Phrase to translate');
    await user.type(textarea, 'Hello');

    const translateButton = screen.getByRole('button', { name: 'Translate' });
    await user.click(translateButton);

    await waitFor(() => {
      expect(screen.getByText('Hola')).toBeInTheDocument();
    });
  });

  it('should show loading state while translating', async () => {
    (global.fetch as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ translation: 'Hola' }),
      }), 100))
    );

    const user = userEvent.setup();
    render(<TranslationInput />);

    const textarea = screen.getByLabelText('Phrase to translate');
    await user.type(textarea, 'Hello');

    const translateButton = screen.getByRole('button', { name: 'Translate' });
    await user.click(translateButton);

    expect(screen.getByText('Translating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Hola')).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    });

    const user = userEvent.setup();
    render(<TranslationInput />);

    const textarea = screen.getByLabelText('Phrase to translate');
    await user.type(textarea, 'Hello');

    const translateButton = screen.getByRole('button', { name: 'Translate' });
    await user.click(translateButton);

    await waitFor(() => {
      expect(screen.getByText(/Translation failed/)).toBeInTheDocument();
    });
  });

  it('should paste from clipboard when Paste button is clicked', async () => {
    const mockText = 'Pasted text';
    const readTextMock = vi.fn().mockResolvedValue(mockText);

    Object.assign(navigator, {
      clipboard: {
        readText: () => readTextMock(),
      },
    });

    const user = userEvent.setup();
    render(<TranslationInput />);

    const pasteButton = screen.getByRole('button', { name: 'Paste' });
    await user.click(pasteButton);

    await waitFor(() => {
      const textarea = screen.getByLabelText('Phrase to translate');
      expect(textarea).toHaveValue(mockText);
    });
  });

  it('should show error if paste fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        readText: () => Promise.reject(new Error('Clipboard error')),
      },
    });

    const user = userEvent.setup();
    render(<TranslationInput />);

    const pasteButton = screen.getByRole('button', { name: 'Paste' });
    await user.click(pasteButton);

    await waitFor(() => {
      expect(screen.getByText('Unable to paste from clipboard')).toBeInTheDocument();
    });
  });

  it('should change source and target languages', async () => {
    const user = userEvent.setup();
    render(<TranslationInput />);

    const fromSelect = screen.getByLabelText('From');
    const toSelect = screen.getByLabelText('To');

    await user.selectOptions(fromSelect, 'fr');
    await user.selectOptions(toSelect, 'de');

    expect(fromSelect).toHaveValue('fr');
    expect(toSelect).toHaveValue('de');
  });

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<TranslationInput />);

    // Trigger error
    const translateButton = screen.getByRole('button', { name: 'Translate' });
    await user.click(translateButton);
    expect(screen.getByText('Please enter a phrase to translate')).toBeInTheDocument();

    // Clear error by typing
    const textarea = screen.getByLabelText('Phrase to translate');
    await user.type(textarea, 'Hello');

    expect(screen.queryByText('Please enter a phrase to translate')).not.toBeInTheDocument();
  });

  it('should show translation result in green box', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ translation: 'Hola' }),
    });

    const user = userEvent.setup();
    render(<TranslationInput />);

    const textarea = screen.getByLabelText('Phrase to translate');
    await user.type(textarea, 'Hello');

    const translateButton = screen.getByRole('button', { name: 'Translate' });
    await user.click(translateButton);

    await waitFor(() => {
      const translation = screen.getByText('Hola');
      expect(translation.closest('.bg-green-50')).toBeInTheDocument();
    });
  });
});
