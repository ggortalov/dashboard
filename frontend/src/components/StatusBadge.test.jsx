import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="Passed" />);
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });

  const statuses = ['Passed', 'Failed', 'Blocked', 'Retest', 'Untested'];

  statuses.forEach((status) => {
    it(`applies correct CSS class for status "${status}"`, () => {
      render(<StatusBadge status={status} />);
      const badge = screen.getByText(status);
      expect(badge).toHaveClass('status-badge');
      expect(badge).toHaveClass('status-badge-md');
    });
  });

  it('applies size class based on size prop', () => {
    render(<StatusBadge status="Passed" size="sm" />);
    const badge = screen.getByText('Passed');
    expect(badge).toHaveClass('status-badge-sm');
  });

  it('falls back to Untested style for unknown status', () => {
    render(<StatusBadge status="Unknown" />);
    const badge = screen.getByText('Unknown');
    expect(badge).toHaveClass('status-badge');
  });
});
