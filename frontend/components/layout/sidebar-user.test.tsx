import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SidebarUser } from './sidebar-user';
import * as clerk from '@clerk/nextjs';

vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
  useClerk: vi.fn(),
  UserButton: ({ afterSignOutUrl }: { afterSignOutUrl: string }) => (
    <div data-testid="user-button" data-after-sign-out-url={afterSignOutUrl}>
      UserButton
    </div>
  ),
}));

describe('SidebarUser', () => {
  const mockSignOut = vi.fn().mockResolvedValue(undefined);
  const mockUser = {
    id: 'user_123',
    firstName: 'John',
    lastName: 'Doe',
    emailAddresses: [
      { emailAddress: 'john.doe@example.com' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clerk.useClerk).mockReturnValue({
      signOut: mockSignOut,
    } as unknown as ReturnType<typeof clerk.useClerk>);
    vi.mocked(clerk.useUser).mockReturnValue({
      user: mockUser,
      isLoaded: true,
    } as ReturnType<typeof clerk.useUser>);
  });

  describe('rendering', () => {
    it('renders UserButton component', () => {
      render(<SidebarUser collapsed={false} plan="free" />);
      expect(screen.getByTestId('user-button')).toBeInTheDocument();
    });

    it('renders user first name when not collapsed', () => {
      render(<SidebarUser collapsed={false} plan="free" />);
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('renders user email when first name is not available', () => {
      vi.mocked(clerk.useUser).mockReturnValue({
        user: {
          ...mockUser,
          firstName: null,
        },
        isLoaded: true,
      } as ReturnType<typeof clerk.useUser>);

      render(<SidebarUser collapsed={false} plan="free" />);
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('renders "Operator" as fallback when user data is not available', () => {
      vi.mocked(clerk.useUser).mockReturnValue({
        user: null,
        isLoaded: true,
      } as ReturnType<typeof clerk.useUser>);

      render(<SidebarUser collapsed={false} plan="free" />);
      expect(screen.getByText('Operator')).toBeInTheDocument();
    });

    it('displays Pro Tier badge for pro plan', () => {
      render(<SidebarUser collapsed={false} plan="pro" />);
      expect(screen.getByText('Pro Tier')).toBeInTheDocument();
    });

    it('displays Free Tier badge for free plan', () => {
      render(<SidebarUser collapsed={false} plan="free" />);
      expect(screen.getByText('Free Tier')).toBeInTheDocument();
    });

    it('shows Pro sparkles indicator when plan is pro', () => {
      const { container } = render(<SidebarUser collapsed={false} plan="pro" />);
      const sparkles = container.querySelector('.bg-gradient-to-br.from-amber-400');
      expect(sparkles).toBeInTheDocument();
    });

    it('does not show Pro sparkles indicator when plan is free', () => {
      const { container } = render(<SidebarUser collapsed={false} plan="free" />);
      const sparkles = container.querySelector('.bg-gradient-to-br.from-amber-400');
      expect(sparkles).not.toBeInTheDocument();
    });
  });

  describe('collapsed state', () => {
    it('hides user info when collapsed', () => {
      render(<SidebarUser collapsed={true} plan="free" />);
      expect(screen.queryByText('John')).not.toBeInTheDocument();
      expect(screen.queryByText('Free Tier')).not.toBeInTheDocument();
    });

    it('shows icon-only sign out button when collapsed', () => {
      render(<SidebarUser collapsed={true} plan="free" />);
      const signOutButton = screen.getByLabelText('Sign out');
      expect(signOutButton).toBeInTheDocument();
      expect(signOutButton.querySelector('svg')).toBeInTheDocument();
    });

    it('shows full sign out button when not collapsed', () => {
      render(<SidebarUser collapsed={false} plan="free" />);
      const signOutButton = screen.getByText('Sign Out');
      expect(signOutButton).toBeInTheDocument();
      expect(signOutButton.closest('button')).toHaveTextContent('Sign Out');
    });
  });

  describe('sign out functionality', () => {
    it('calls signOut when sign out button is clicked (expanded)', async () => {
      const user = userEvent.setup();
      render(<SidebarUser collapsed={false} plan="free" />);

      const signOutButton = screen.getByText('Sign Out');
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: '/' });
      });
    });

    it('calls signOut when sign out button is clicked (collapsed)', async () => {
      const user = userEvent.setup();
      render(<SidebarUser collapsed={true} plan="free" />);

      const signOutButton = screen.getByLabelText('Sign out');
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: '/' });
      });
    });

    it('handles sign out errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSignOut.mockRejectedValueOnce(new Error('Sign out failed'));

      render(<SidebarUser collapsed={false} plan="free" />);

      const signOutButton = screen.getByText('Sign Out');
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: '/' });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to sign out:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('UserButton configuration', () => {
    it('passes correct afterSignOutUrl to UserButton', () => {
      render(<SidebarUser collapsed={false} plan="free" />);
      const userButton = screen.getByTestId('user-button');
      expect(userButton).toHaveAttribute('data-after-sign-out-url', '/');
    });
  });

  describe('layout and styling', () => {
    it('applies correct classes when collapsed', () => {
      const { container } = render(<SidebarUser collapsed={true} plan="free" />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toContain('flex flex-col items-center');
    });

    it('applies correct classes when not collapsed', () => {
      const { container } = render(<SidebarUser collapsed={false} plan="free" />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).not.toContain('flex flex-col items-center');
    });

    it('sign out button has correct styling when expanded', () => {
      render(<SidebarUser collapsed={false} plan="free" />);
      const signOutButton = screen.getByText('Sign Out').closest('button');
      expect(signOutButton).toHaveClass('w-full', 'justify-start');
    });

    it('sign out button has correct styling when collapsed', () => {
      render(<SidebarUser collapsed={true} plan="free" />);
      const signOutButton = screen.getByLabelText('Sign out');
      expect(signOutButton).toHaveClass('w-10', 'h-10');
    });
  });
});
