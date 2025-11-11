import React, { useState } from 'react';
import type { User } from '../types';
import { DentalIcon, LogoutIcon, UserCircleIcon, SearchIcon } from './IconComponents';
import { SearchModal } from './SearchModal';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery);
    }
  };

  return (
    <>
      <header className="bg-blue-600 p-4 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full">
              <DentalIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">DentalConnect</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-blue-500 text-white rounded-full py-2 pl-10 pr-4 w-64 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200" />
            </form>

             {/* Mobile Search Icon */}
            <button onClick={() => setSearchVisible(!isSearchVisible)} className="text-white md:hidden">
              <SearchIcon className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-2 text-white">
              <UserCircleIcon className="h-8 w-8" />
              <span className="font-semibold hidden sm:inline">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              title="Logout"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Mobile Search Bar */}
        {isSearchVisible && (
            <form onSubmit={handleSearchSubmit} className="mt-4 md:hidden relative">
                <input
                    type="text"
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-blue-500 text-white rounded-full py-2 pl-10 pr-4 w-full placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200" />
            </form>
        )}
      </header>
      {submittedQuery && (
        <SearchModal query={submittedQuery} onClose={() => setSubmittedQuery('')} />
      )}
    </>
  );
};
