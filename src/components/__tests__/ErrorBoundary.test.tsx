import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '@/components/ErrorBoundary';

// Mock component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Mock console.error to suppress error logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders fallback UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please refresh the page to try again.')).toBeInTheDocument();
  });

  it('renders custom fallback UI when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('logs error to console when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith('Error caught by boundary:', expect.any(Error), expect.any(Object));
  });
});