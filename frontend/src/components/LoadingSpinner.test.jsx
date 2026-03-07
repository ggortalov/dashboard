import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    // The spinner is the first child div inside the wrapper
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
    // The spinner div is the first child (the rotating circle)
    const spinnerDiv = wrapper.firstChild;
    expect(spinnerDiv).toBeInTheDocument();
    expect(spinnerDiv.tagName).toBe('DIV');
    expect(spinnerDiv.style.animation).toContain('spin');
  });
});
