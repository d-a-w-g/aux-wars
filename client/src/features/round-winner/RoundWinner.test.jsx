import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoundWinner from './RoundWinner';
import Song from '../../components/Song';
import album from './album-placeholder.jpg';

const mockSongs = [
  <Song 
    key="1" 
    track="Test Track 1" 
    artist="Test Artist 1" 
    player="Player 1" 
    albumCover={album} 
    rating="20" 
    winner="true" 
  />,
  <Song 
    key="2" 
    track="Test Track 2" 
    artist="Test Artist 2" 
    player="Player 2" 
    albumCover={album} 
    rating="15" 
    winner="false" 
  />
];

describe('RoundWinner', () => {
  it('renders without crashing', () => {
    render(<RoundWinner songs={mockSongs} />);
  });

  it('displays all songs passed as props', () => {
    render(<RoundWinner songs={mockSongs} />);
    expect(screen.getByText('Test Track 1')).toBeInTheDocument();
    expect(screen.getByText('Test Track 2')).toBeInTheDocument();
  });

  it('displays the next button', () => {
    render(<RoundWinner songs={mockSongs} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
}); 