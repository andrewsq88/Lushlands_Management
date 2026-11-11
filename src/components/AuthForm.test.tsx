import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from './AuthForm';

const signUp = vi.fn();
const signIn = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ signUp, signIn, user: null, loading: false, signOut: vi.fn() }),
}));

const TYPED_EMAIL = 'new.tenant@example.test';

async function fillAndSubmitSignUp() {
  const user = userEvent.setup();
  render(<AuthForm />);
  await user.click(screen.getByRole('button', { name: "Don't have an account? Sign up" }));
  await user.type(screen.getByLabelText('First name'), 'Ada');
  await user.type(screen.getByLabelText('Last name'), 'Lovelace');
  await user.type(screen.getByLabelText('Email address'), TYPED_EMAIL);
  await user.type(screen.getByLabelText('Password'), 'correct-horse-battery');
  await user.click(screen.getByRole('button', { name: 'Sign up' }));
  return user;
}

describe('AuthForm sign-up confirmation', () => {
  beforeEach(() => {
    signUp.mockReset();
    signIn.mockReset();
  });

  it('replaces the form with a check-your-email message when no session is returned', async () => {
    signUp.mockResolvedValue({ data: { user: { id: 'u1' }, session: null }, error: null });
    const logSpy = vi.spyOn(console, 'log');

    const user = await fillAndSubmitSignUp();

    expect(await screen.findByText('Check your email to confirm your account')).toBeInTheDocument();
    expect(screen.getByText(TYPED_EMAIL)).toBeInTheDocument();
    // The form is gone, so it cannot be resubmitted.
    expect(screen.queryByRole('button', { name: 'Sign up' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(signUp).toHaveBeenCalledTimes(1);
    // The address is never logged.
    expect(logSpy.mock.calls.flat().join(' ')).not.toContain(TYPED_EMAIL);

    await user.click(screen.getByRole('button', { name: 'Back to sign in' }));
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Check your email to confirm your account')).not.toBeInTheDocument();
    logSpy.mockRestore();
  });

  it('does not show the message when sign-up returns a session', async () => {
    signUp.mockResolvedValue({ data: { user: { id: 'u1' }, session: { access_token: 'x' } }, error: null });
    await fillAndSubmitSignUp();
    expect(screen.queryByText('Check your email to confirm your account')).not.toBeInTheDocument();
  });

  it('keeps the form and shows the error when sign-up fails', async () => {
    signUp.mockResolvedValue({ data: null, error: { message: 'Password is too weak' } });
    await fillAndSubmitSignUp();
    expect(await screen.findByText('Password is too weak')).toBeInTheDocument();
    expect(screen.queryByText('Check your email to confirm your account')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
  });
});

describe('AuthForm initial mode by path', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it.each([
    ['/signup', 'Sign up'],
    ['/signup/', 'Sign up'],
    ['/login', 'Sign in'],
    ['/auth', 'Sign in'],
  ])('%s opens with the %s button', (path, button) => {
    window.history.replaceState(null, '', path);
    render(<AuthForm />);
    expect(screen.getByRole('button', { name: button })).toBeInTheDocument();
  });
});
