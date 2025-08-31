import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Ghost, Home } from "lucide-react"; // Medium-sized icon
import { Button } from "../components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: Invalid route accessed ->", location.pathname);
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div 
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div 
          className="flex justify-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="p-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full shadow-soft">
            <Ghost className="text-red-400" size={80} />
          </div>
        </div>
        
        <h1 
          className="text-6xl font-bold font-display gradient-text mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          404
        </h1>
        
        <h2 
          className="text-2xl font-semibold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Page Not Found
        </h2>
        
        <p 
          className="text-lg text-gray-500 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Button
            onClick={() => navigate("/")}
            className="px-8 py-3 text-lg font-semibold"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
