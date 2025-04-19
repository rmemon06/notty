import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricsDashboard from './metricsDashboard';

describe('MetricsDashboard', () => {
  it('renders all metric labels and values', () => {
    render(<MetricsDashboard wordCount={123} characterCount={456} readingTime={1} />);

    expect(screen.getByText(/Word Count/i)).toBeInTheDocument();
    expect(screen.getByText(/123/)).toBeInTheDocument();
    expect(screen.getByText(/Character Count/i)).toBeInTheDocument();
    expect(screen.getByText(/456/)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Reading Time/i)).toBeInTheDocument();
    expect(screen.getByText(/1 min/)).toBeInTheDocument(); // Match the number format
  });
});
