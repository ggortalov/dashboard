import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriorityBadge from './PriorityBadge';

describe('PriorityBadge', () => {
  it('renders the priority text', () => {
    render(<PriorityBadge priority="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  const priorities = ['Critical', 'High', 'Medium', 'Low'];

  priorities.forEach((priority) => {
    it(`applies correct CSS class for priority "${priority}"`, () => {
      render(<PriorityBadge priority={priority} />);
      const badge = screen.getByText(priority);
      expect(badge).toHaveClass('priority-badge');
    });
  });

  it('falls back to Medium style for unknown priority', () => {
    render(<PriorityBadge priority="Unknown" />);
    const badge = screen.getByText('Unknown');
    expect(badge).toHaveClass('priority-badge');
  });
});
