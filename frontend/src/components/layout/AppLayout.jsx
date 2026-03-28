import Sidebar from './Sidebar';
import TopNav from './TopNav';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-app text-app-primary">
      <Sidebar />
      <div className="md:pl-72 min-h-screen">
        <TopNav />
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
