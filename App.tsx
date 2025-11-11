import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { DentistDashboard } from './components/DentistDashboard';
import { ProfileSetup } from './components/ProfileSetup';
import { Header } from './components/Header';
import { Chatbot } from './components/Chatbot';
import { users as initialUsers } from './users';
import type { User } from './types';

const USERS_STORAGE_KEY = 'dentalConnectUsers';
const USER_ID_STORAGE_KEY = 'dentalConnectUserId';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Initialize users from localStorage or seed with initial data
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const loadedUsers = savedUsers ? JSON.parse(savedUsers) : initialUsers;
      setAllUsers(loadedUsers);
      
      const savedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);
      if (savedUserId) {
        const user = loadedUsers.find((u: User) => u.id === savedUserId);
        if (user) {
          setCurrentUser(user);
        }
      }
      
      if (!savedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error("Failed to load users from localStorage", error);
      // Fallback to initial users if localStorage is corrupt or full
      setAllUsers(initialUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      setCurrentUser(null);
      localStorage.removeItem(USER_ID_STORAGE_KEY);
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(USER_ID_STORAGE_KEY, user.id);
      setLoginError(null);
    } else {
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  const handleSignUp = (name: string, email: string, password: string) => {
    const lowercasedEmail = email.toLowerCase();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === lowercasedEmail);

    if (existingUser) {
      setLoginError('An account with this email already exists. Please sign in.');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email: lowercasedEmail,
      password,
      role: 'patient', // Default new users to patient role
      profileComplete: false,
    };

    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    setCurrentUser(newUser);
    localStorage.setItem(USER_ID_STORAGE_KEY, newUser.id);
    setLoginError(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_ID_STORAGE_KEY);
  };

  const handleUpdateUsers = (usersToUpdate: User[]) => {
    const userMap = new Map(usersToUpdate.map(u => [u.id, u]));
    
    const newAllUsers = allUsers.map(u => userMap.get(u.id) || u);
    setAllUsers(newAllUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newAllUsers));

    // Also update currentUser if they were in the list of updates
    const updatedCurrentUser = usersToUpdate.find(u => u.id === currentUser?.id);
    if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    handleUpdateUsers([updatedUser]);
  };


  const renderContent = () => {
    if (!currentUser) {
      return <Login onLogin={handleLogin} onSignUp={handleSignUp} errorMessage={loginError} />;
    }
    if (!currentUser.profileComplete) {
      return <ProfileSetup user={currentUser} onProfileComplete={handleProfileUpdate} />;
    }
    if (currentUser.role === 'dentist') {
      return <DentistDashboard user={currentUser} allUsers={allUsers} onUpdateUsers={handleUpdateUsers} />;
    }
    // Default to patient dashboard
    return <Dashboard user={currentUser} onUpdateUser={handleProfileUpdate} allUsers={allUsers} onUpdateUsers={handleUpdateUsers} />;
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {currentUser && currentUser.profileComplete && (
        <>
          <Header user={currentUser} onLogout={handleLogout} />
          <main>
            {renderContent()}
          </main>
          <Chatbot />
        </>
      )}
      {!currentUser || !currentUser.profileComplete ? renderContent() : null}
    </div>
  );
}

export default App;