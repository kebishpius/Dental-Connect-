import React, { useState } from 'react';
import { DentalIcon, AlertTriangleIcon } from './IconComponents';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (name: string, email: string, password: string) => void;
  errorMessage: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onSignUp, errorMessage }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    onLogin(email, password);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return;
    }
    setValidationError('');
    onSignUp(name, email, password);
  };

  const switchView = (newView: 'login' | 'signup') => {
    setView(newView);
    // Clear form fields and errors when switching
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setValidationError('');
  };

  const commonErrorDisplay = (msg: string | null) => msg && (
    <div className="bg-red-50 border-l-4 border-red-400 p-3 flex items-start">
        <AlertTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
        <p className="text-sm text-red-700">{msg}</p>
    </div>
  );

  const renderLoginForm = () => (
    <form className="space-y-6" onSubmit={handleLoginSubmit}>
      <div>
        <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email-login"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@example.com"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password-login"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      {commonErrorDisplay(errorMessage)}

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign in
        </button>
      </div>
    </form>
  );
  
  const renderSignUpForm = () => (
     <form className="space-y-6" onSubmit={handleSignUpSubmit}>
      <div>
        <label htmlFor="name-signup" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="mt-1">
          <input
            id="name-signup"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
       <div>
        <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email-signup"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password-signup"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
       <div>
        <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirm-password-signup"
            name="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      {commonErrorDisplay(validationError || errorMessage)}

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Account
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg">
                <DentalIcon className="h-10 w-10 text-white" />
            </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {view === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <button
            onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {view === 'login' ? 'create an account' : 'sign in to your existing account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {view === 'login' ? renderLoginForm() : renderSignUpForm()}
          
           <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>
             <div className="mt-4 text-center text-sm">
                <p className="text-gray-500 mb-2">Click to auto-fill credentials:</p>
                <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={() => {setEmail('patient@example.com'); setPassword('password');}} className="text-xs font-semibold px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors">Patient</button>
                    <button type="button" onClick={() => {setEmail('dentist@example.com'); setPassword('password');}} className="text-xs font-semibold px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200 transition-colors">Dentist</button>
                    <button type="button" onClick={() => {setEmail('new@example.com'); setPassword('password');}} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-800 rounded-full hover:bg-slate-200 transition-colors">New User</button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};