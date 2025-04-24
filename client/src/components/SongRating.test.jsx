import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SongRating from './SongRating';

const mockTrack = {
  name: 'Test Song',
  artists: [{ name: 'Test Artist 1' }, { name: 'Test Artist 2' }],
  album: {
    images: [
      { url: 'http://test.com/large.jpg' },
      { url: 'http://test.com/medium.jpg' },
      { url: 'http://test.com/small.jpg' }
    ]
  }
};

describe('SongRating', () => {
  it('renders without crashing', () => {
    render(<SongRating track={mockTrack} />);
  });

  it('displays the song title and artist names', () => {
    render(<SongRating track={mockTrack} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist 1, Test Artist 2')).toBeInTheDocument();
  });

  it('displays the album cover', () => {
    render(<SongRating track={mockTrack} />);
    const albumCover = screen.getByAltText('Test Song');
    expect(albumCover).toBeInTheDocument();
    expect(albumCover).toHaveAttribute('src', 'http://test.com/medium.jpg');
  });

  it('displays 5 rating records', () => {
    render(<SongRating track={mockTrack} />);
    const records = screen.getAllByAltText(/rate this song \d+ records/);
    expect(records).toHaveLength(5);
  });

  it('updates opacity when a record is clicked', () => {
    render(<SongRating track={mockTrack} />);
    const records = screen.getAllByAltText(/rate this song \d+ records/);
    
    // Click the third record
    fireEvent.click(records[2]);
    
    // First three records should be fully opaque
    expect(records[0]).toHaveClass('opacity-100');
    expect(records[1]).toHaveClass('opacity-100');
    expect(records[2]).toHaveClass('opacity-100');
    
    // Last two records should be semi-transparent
    expect(records[3]).toHaveClass('opacity-50');
    expect(records[4]).toHaveClass('opacity-50');
  });

  it('handles missing album images gracefully', () => {
    const trackWithoutImages = {
      name: 'No Image Song',
      artists: [{ name: 'No Image Artist' }],
      album: { images: [] }
    };
    
    render(<SongRating track={trackWithoutImages} />);
    const albumCover = screen.getByAltText('No Image Song');
    expect(albumCover).not.toHaveAttribute('src');
  });
}); 