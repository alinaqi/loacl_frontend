import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilePreview, FileInfo } from './FilePreview';

describe('FilePreview', () => {
  const createMockFile = (name: string, type: string): File => {
    return new File(['test'], name, { type });
  };

  const mockFiles: FileInfo[] = [
    {
      file: createMockFile('image.jpg', 'image/jpeg'),
      previewUrl: 'mock-image-url',
      progress: 50,
    },
    {
      file: createMockFile('document.pdf', 'application/pdf'),
      previewUrl: 'mock-pdf-url',
    },
    {
      file: createMockFile('text.txt', 'text/plain'),
      error: 'Failed to upload',
    },
  ];

  it('renders file previews correctly', () => {
    render(<FilePreview files={mockFiles} />);
    
    // Check file names are displayed
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('text.txt')).toBeInTheDocument();

    // Check file sizes are displayed
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
    expect(screen.getByText('2.0 MB')).toBeInTheDocument();
    expect(screen.getByText('512 B')).toBeInTheDocument();

    // Check progress indicator
    expect(screen.getByText('50% uploaded')).toBeInTheDocument();

    // Check error message
    expect(screen.getByText('Failed to upload')).toBeInTheDocument();
  });

  it('handles remove button clicks', () => {
    const onRemove = jest.fn();
    render(<FilePreview files={mockFiles} onRemove={onRemove} />);
    
    const removeButtons = screen.getAllByLabelText(/Remove .*/);
    fireEvent.click(removeButtons[0]);
    
    expect(onRemove).toHaveBeenCalledWith(mockFiles[0].file);
  });

  it('handles retry button clicks', () => {
    const onRetry = jest.fn();
    render(<FilePreview files={mockFiles} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledWith(mockFiles[2].file);
  });

  it('renders image preview when available', () => {
    render(<FilePreview files={mockFiles} />);
    
    const imagePreview = screen.getByAltText('image.jpg');
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveAttribute('src', 'mock-image-url');
  });

  it('renders PDF preview when available', () => {
    render(<FilePreview files={mockFiles} />);
    
    const pdfPreview = screen.getByTitle('document.pdf');
    expect(pdfPreview).toBeInTheDocument();
    expect(pdfPreview).toHaveAttribute('src', 'mock-pdf-url');
  });

  it('renders generic file icon for unsupported file types', () => {
    render(<FilePreview files={mockFiles} />);
    
    // The text file should show a generic file icon
    const fileIcons = screen.getAllByRole('img', { hidden: true });
    expect(fileIcons).toHaveLength(3); // 2 close icons + 1 file icon
  });

  it('has correct accessibility attributes', () => {
    render(<FilePreview files={mockFiles} />);
    
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(4); // 3 remove buttons + 1 retry button
  });
}); 