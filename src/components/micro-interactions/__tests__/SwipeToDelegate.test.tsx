import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SwipeToDelegate } from '../SwipeToDelegate';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onDragEnd, onDrag, onDragStart, ...props }: any) => (
      <div 
        {...props}
        data-testid="swipe-card"
        onMouseDown={(e) => onDragStart && onDragStart()}
        onMouseMove={(e) => onDrag && onDrag(e, { offset: { x: 100, y: 0 } })}
        onMouseUp={(e) => onDragEnd && onDragEnd(e, { offset: { x: 150, y: 0 } })}
      >
        {children}
      </div>
    ),
  },
  useMotionValue: () => ({ get: () => 0, set: jest.fn() }),
  useTransform: () => 1,
  PanInfo: {},
}));

describe('SwipeToDelegate', () => {
  const mockOnDelegate = jest.fn();
  const mockChildren = <div>Test Email</div>;

  beforeEach(() => {
    mockOnDelegate.mockClear();
  });

  it('renders children correctly', () => {
    render(
      <SwipeToDelegate onDelegate={mockOnDelegate}>
        {mockChildren}
      </SwipeToDelegate>
    );
    
    expect(screen.getByText('Test Email')).toBeInTheDocument();
  });

  it('shows instruction text', () => {
    render(
      <SwipeToDelegate onDelegate={mockOnDelegate}>
        {mockChildren}
      </SwipeToDelegate>
    );
    
    expect(screen.getByText('Swipe left or right to delegate')).toBeInTheDocument();
  });

  it('handles drag interaction', () => {
    render(
      <SwipeToDelegate onDelegate={mockOnDelegate}>
        {mockChildren}
      </SwipeToDelegate>
    );
    
    const swipeCard = screen.getByTestId('swipe-card');
    
    // Simulate drag start
    fireEvent.mouseDown(swipeCard);
    
    // Simulate drag
    fireEvent.mouseMove(swipeCard);
    
    // Simulate drag end
    fireEvent.mouseUp(swipeCard);
    
    // Should call onDelegate if dragged far enough
    expect(mockOnDelegate).toHaveBeenCalled();
  });

  it('applies correct styling classes', () => {
    render(
      <SwipeToDelegate onDelegate={mockOnDelegate} className="custom-class">
        {mockChildren}
      </SwipeToDelegate>
    );
    
    expect(screen.getByTestId('swipe-card')).toHaveClass('bg-white', 'rounded-lg', 'shadow-md');
  });

  it('has proper accessibility attributes', () => {
    render(
      <SwipeToDelegate onDelegate={mockOnDelegate}>
        {mockChildren}
      </SwipeToDelegate>
    );
    
    const swipeCard = screen.getByTestId('swipe-card');
    expect(swipeCard).toHaveClass('cursor-grab');
  });
});