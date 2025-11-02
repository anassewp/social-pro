// Unit tests for core components
// Tests for individual UI components and their functionality

describe('Component Unit Tests', () => {
  // Loading Components Tests
  describe('Loading Components', () => {
    test('should render Loading component', async () => {
      const { render, screen } = require('@testing-library/react');
      const Loading = require('@/components/ui/Loading').Loading;
      
      render(<Loading />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('should render AdaptiveLoading with custom size', async () => {
      const { render, screen } = require('@testing-library/react');
      const AdaptiveLoading = require('@/components/ui/loading/AdaptiveLoading').AdaptiveLoading;
      
      render(<AdaptiveLoading size="large" />);
      
      const loader = screen.getByTestId('adaptive-loading');
      expect(loader).toHaveClass('loading-large');
    });

    test('should render Skeleton with correct variant', async () => {
      const { render, screen } = require('@testing-library/react');
      const { Skeleton } = require('@/components/ui/Skeleton');
      
      render(<Skeleton variant="rectangular" width={200} height={200} />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('style', expect.stringContaining('width: 200px'));
    });
  });

  // Theme Components Tests
  describe('Theme Components', () => {
    test('should toggle theme correctly', async () => {
      const { render, screen, fireEvent } = require('@testing-library/react');
      const userEvent = require('@testing-library/user-event');
      const ThemeToggle = require('@/components/theme/EnhancedThemeToggle').EnhancedThemeToggle;
      
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      await userEvent.click(toggleButton);
      
      expect(toggleButton).toHaveAttribute('aria-pressed');
    });

    test('should apply theme wrapper correctly', async () => {
      const { render } = require('@testing-library/react');
      const { render: renderToString } = require('@testing-library/react');
      const ThemeWrapper = require('@/components/theme/EnhancedThemeWrapper').EnhancedThemeWrapper;
      
      const { container } = render(
        <ThemeWrapper>
          <div>Test Content</div>
        </ThemeWrapper>
      );
      
      expect(container.firstChild).toHaveClass('theme-wrapper');
    });
  });

  // Button Components Tests
  describe('Button Components', () => {
    test('should render Button with correct variant', async () => {
      const { render, screen } = require('@testing-library/react');
      const { Button } = require('@/components/ui/button');
      
      render(<Button variant="primary">Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('btn-primary');
    });

    test('should handle button click events', async () => {
      const { render, screen } = require('@testing-library/react');
      const userEvent = require('@testing-library/user-event');
      const { Button } = require('@/components/ui/button');
      const onClick = jest.fn();
      
      render(<Button onClick={onClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // Form Components Tests
  describe('Form Components', () => {
    test('should render Input component', async () => {
      const { render, screen } = require('@testing-library/react');
      const { Input } = require('@/components/ui/input');
      
      render(<Input placeholder="Enter text" />);
      
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    test('should render Select component', async () => {
      const { render, screen } = require('@testing-library/react');
      const { Select } = require('@/components/ui/select');
      
      render(
        <Select>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </Select>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  // Card Components Tests
  describe('Card Components', () => {
    test('should render Card component', async () => {
      const { render, screen } = require('@testing-library/react');
      const { Card } = require('@/components/ui/card');
      
      render(
        <Card>
          <CardHeader>Test Header</CardHeader>
          <CardContent>Test Content</CardContent>
        </Card>
      );
      
      expect(screen.getByText('Test Header')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('should render StatsCard with correct metrics', async () => {
      const { render, screen } = require('@testing-library/react');
      const StatsCard = require('@/components/dashboard/StatsCard').StatsCard;
      
      const stats = {
        title: 'Total Users',
        value: 1234,
        change: '+5.2%',
        trend: 'up',
      };
      
      render(<StatsCard {...stats} />);
      
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('+5.2%')).toBeInTheDocument();
    });
  });

  // Navigation Components Tests
  describe('Navigation Components', () => {
    test('should render Sidebar component', async () => {
      const { render, screen } = require('@testing-library/react');
      const Sidebar = require('@/components/layout/Sidebar').Sidebar;
      
      render(<Sidebar />);
      
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toBeInTheDocument();
    });

    test('should render MobileNavigation component', async () => {
      const { render, screen } = require('@testing-library/react');
      const MobileNavigation = require('@/components/layout/MobileNavigation').MobileNavigation;
      
      render(<MobileNavigation />);
      
      const mobileNav = screen.getByTestId('mobile-navigation');
      expect(mobileNav).toBeInTheDocument();
    });
  });

  // Error Boundary Tests
  describe('Error Boundary', () => {
    test('should catch and display errors', async () => {
      const { render, screen } = require('@testing-library/react');
      const ErrorBoundary = require('@/components/ErrorBoundary').ErrorBoundary;
      
      // Mock console.error to suppress React error boundary logs
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const ThrowError = () => {
        throw new Error('Test error');
      };
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});

// Performance component tests
describe('Component Performance Tests', () => {
  test('should render Loading component within performance threshold', async () => {
    const { render } = require('@testing-library/react');
    const Loading = require('@/components/ui/Loading').Loading;
    
    const { duration } = await testUtils.measurePerformance(() => {
      render(<Loading />);
    });
    
    expect(duration).toBeLessThan(100); // Should render within 100ms
  });

  test('should not cause memory leaks with repeated renders', async () => {
    const { render, unmount } = require('@testing-library/react');
    const Loading = require('@/components/ui/Loading').Loading;
    
    const initialMemory = testUtils.trackMemory();
    
    // Render and unmount multiple times
    for (let i = 0; i < 100; i++) {
      const { unmount: unmountComponent } = render(<Loading />);
      unmountComponent();
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = testUtils.trackMemory();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    // Memory increase should be minimal (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});

// Accessibility component tests
describe('Component Accessibility Tests', () => {
  test('should have proper ARIA labels', async () => {
    const { render, screen } = require('@testing-library/react');
    const { Button } = require('@/components/ui/button');
    
    render(<Button aria-label="Close dialog">Close</Button>);
    
    const button = screen.getByLabelText('Close dialog');
    expect(button).toHaveAttribute('aria-label', 'Close dialog');
  });

  test('should support keyboard navigation', async () => {
    const { render, screen } = require('@testing-library/react');
    const userEvent = require('@testing-library/user-event');
    const { Button } = require('@/components/ui/button');
    
    render(
      <div>
        <Button>First Button</Button>
        <Button>Second Button</Button>
      </div>
    );
    
    const firstButton = screen.getByText('First Button');
    const secondButton = screen.getByText('Second Button');
    
    // Should be able to tab between buttons
    await userEvent.tab();
    expect(firstButton).toHaveFocus();
    
    await userEvent.tab();
    expect(secondButton).toHaveFocus();
  });

  test('should have proper color contrast', async () => {
    // This would require additional testing utilities like jest-axe
    // For now, we'll check for basic color properties
    const { render } = require('@testing-library/react');
    const { Button } = require('@/components/ui/button');
    
    const { container } = render(<Button variant="primary">Test</Button>);
    
    const button = container.querySelector('.btn-primary');
    expect(button).toHaveStyle({
      color: expect.stringMatching(/#|rgb|hsl/),
      backgroundColor: expect.stringMatching(/#|rgb|hsl/),
    });
  });
});