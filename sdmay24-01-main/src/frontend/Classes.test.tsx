import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Classes from './Classes'; // Adjust the import path as necessary

test('opens dialog on add class button click', async () => {
  fetchMock.mockResponseOnce(JSON.stringify([])); // Use fetchMock for mocking

  render(<Classes />);

  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

  fireEvent.click(screen.getByText('Add Class'));

  expect(screen.getByText('Add Class')).toBeInTheDocument();
});

