import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import TimeSlotGrid from './TimeSlotGrid'; // Adjust the import path as necessary

describe('TimeSlotGrid Component Tests', () => {
  test('adds a new tab correctly', async () => {
    const { getByText, getAllByRole } = render(<TimeSlotGrid />);
    // Assuming each tab can be represented as a button or another role, adjust accordingly
    const initialTabCount = getAllByRole('button', { name: /Tab \d/i }).length;

    // Action: Add tab
    fireEvent.click(getByText('+'));
    const updatedTabCount = getAllByRole('button', { name: /Tab \d/i }).length;
    expect(updatedTabCount).toBeGreaterThan(initialTabCount);
  });

  // You can add more tests to cover other functionalities
});
