import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import RecipeSearch from './components/RecipeSearch';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Store token from URL on first load (after OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      window.history.replaceState({}, document.title, '/'); // Clean up the URL
    }
  }, []);

  // Check auth status using token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/auth/status', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Preparing your kitchen...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="/food_img.avif"
            alt="Kitchen background"
            className="w-full h-full object-cover opacity-70"
          />
        </div>

        {/* Login content with gradient overlay */}
        <div className="relative z-10 flex flex-col min-h-screen bg-gradient-to-br from-blue-50/70 to-purple-50/70">
          <div className="flex-grow flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
              <Login />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
    {/* Background Image Layer */}
    <div className="absolute inset-0 z-0">
      <img
        src="/food_img.avif" // 👉 update this to your image path
        alt="Kitchen background"
        className="w-full h-full object-cover opacity-70"
      />
    </div>

    {/* Main content layer */}
    <div className="relative z-10 flex flex-col min-h-screen bg-gradient-to-br from-blue-50/70 to-purple-50/70">
      <header className="bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🍳</span>
              <h1 className="text-2xl font-bold tracking-tight">Recipe Portal</h1>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Let's Cook Something Amazing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover mouth-watering recipes and create culinary masterpieces with ease!
            </p>
          </div>

          <div className="flex justify-center items-center h-full">
            <div className="w-full max-w-4xl space-y-8">
              <div className="card bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="card-body p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Search Recipes</h2>
                  </div>
                  <RecipeSearch />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Recipe Portal. Made by Dhanya.
        </div>
      </footer>
    </div>
    </div>
  );
}

export default App;