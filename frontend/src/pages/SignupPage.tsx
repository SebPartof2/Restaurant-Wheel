// Signup page

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';

export function SignupPage() {
  const [step, setStep] = useState<'code' | 'details'>('code');
  const [signupCode, setSignupCode] = useState('');
  const [expectedEmail, setExpectedEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await api.verifyCode({ signup_code: signupCode });
      setExpectedEmail(result.email);
      setName(result.name || '');
      setEmail(result.email);
      setStep('details');
      toast.success('Code verified! Please complete your signup.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid signup code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (email.toLowerCase() !== expectedEmail.toLowerCase()) {
      toast.error('Email does not match the signup code. Please use the correct email address.');
      return;
    }

    setLoading(true);

    try {
      await signup({ signup_code: signupCode, email, password, name: name || undefined });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-light">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">🎡 The Wheel - Chesterton Edition</h1>
          <p className="text-gray-600">
            {step === 'code' ? 'Enter your signup code' : 'Complete your account'}
          </p>
        </div>

        {step === 'code' ? (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="label">Signup Code</label>
              <input
                type="text"
                value={signupCode}
                onChange={(e) => setSignupCode(e.target.value.toUpperCase())}
                className="input text-center text-2xl font-mono tracking-widest"
                placeholder="XXXXX"
                maxLength={5}
                required
                autoFocus
              />
              <p className="text-sm text-gray-600 mt-2">
                Enter the 5-character code provided by your admin
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || signupCode.length !== 5}
              className="btn btn-primary w-full"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Required Email:</strong> {expectedEmail}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You must use this email address to complete signup
              </p>
            </div>

            <div>
              <label className="label">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder={expectedEmail}
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Must match: {expectedEmail}
              </p>
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('code')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
