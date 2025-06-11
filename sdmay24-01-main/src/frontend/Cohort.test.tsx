import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Cohort from './Cohort'; // Adjust the import path as necessary

describe('Cohort Component Tests', () => {
  test('Dialog opens on "Add Cohort" button click', async () => {
    const { getByText } = render(<Cohort />);
    fireEvent.click(getByText('Add Cohort'));
    expect(getByText('Add Cohort')).toBeInTheDocument(); // Adjust based on the actual dialog content
  });

  // Additional tests go here
});
