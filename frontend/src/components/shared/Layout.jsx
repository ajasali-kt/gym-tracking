import Navbar from './Navbar';

/**
 * Layout Component
 * Wraps all pages with consistent layout structure
 */
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-6 py-6 max-w-7xl flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-6 py-4 text-center text-gray-600 text-sm">
          Gym Tracker &copy; 2025 - Track Your Fitness Journey
        </div>
      </footer>
    </div>
  );
}

export default Layout;
