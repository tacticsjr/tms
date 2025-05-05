
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to admin login page
    navigate('/admin/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Velammal AI Scheduler</h1>
        <p className="text-xl text-gray-600">Redirecting to admin login...</p>
        <div className="mt-4">
          <div className="spinner h-8 w-8 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
