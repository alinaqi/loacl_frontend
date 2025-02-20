import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileUpload } from './FileUpload';

describe('FileUpload', () => {
  const mockOnFileSelect = jest.fn();
  const defaultProps = {
    onFileSelect: mockOnFileSelect,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders file upload area with default props', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(/drag and drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/any file type accepted/i)).toBeInTheDocument();
  });

  it('shows correct text for multiple file upload', () => {
    render(<FileUpload {...defaultProps} multiple />);
    
    expect(screen.getByText(/drag and drop your files here/i)).toBeInTheDocument();
  });

  it('displays custom accepted file types', () => {
    render(<FileUpload {...defaultProps} accept={['.pdf', 'image/*']} />);
    
    expect(screen.getByText(/accepted types: .pdf, image\/\*/i)).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid file type';
    render(<FileUpload {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles file selection through input', () => {
    render(<FileUpload {...defaultProps} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('File upload');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    
    expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
  });

  it('handles drag and drop events', () => {
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByRole('button');
    
    // Test drag enter
    fireEvent.dragEnter(dropZone);
    expect(dropZone).toHaveClass('border-blue-500');
    
    // Test drag leave
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('border-blue-500');
  });

  it('validates file size', () => {
    const maxSize = 5 * 1024; // 5KB
    render(<FileUpload {...defaultProps} maxSize={maxSize} />);
    
    const file = new File(['x'.repeat(maxSize + 1)], 'large.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('File upload');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('validates file type', () => {
    render(<FileUpload {...defaultProps} accept={['.pdf']} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('File upload');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });
}); 