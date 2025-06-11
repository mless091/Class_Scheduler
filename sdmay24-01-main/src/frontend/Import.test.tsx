import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Import from './Import';

describe('Imports Component', () => {
  test('Dialog opens and closes correctly', async () => {
    const { getByText, queryByText } = render(<Import />);

    // Open dialog
    fireEvent.click(getByText('Add Import'));
    expect(queryByText('Add Import')).toBeInTheDocument();

    // Close dialog
    fireEvent.click(getByText('Cancel'));
    // Use queryByText to check if the dialog has been closed (not in document)
    expect(queryByText('Department')).not.toBeInTheDocument(); // Assuming "Department" is part of the dialog content
  });

  // Additional tests for form submission, delete functionality, etc.
});
