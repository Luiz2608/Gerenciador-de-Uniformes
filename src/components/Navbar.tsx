import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shirt, Users, Calendar, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Shirt className="h-8 w-8" />
              <span className="text-xl font-bold">Gestão de Uniformes</span>
            </Link>
            
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Painel</span>
              </Link>
              
              <Link
                to="/athletes"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/athletes')}`}
              >
                <Users className="h-5 w-5" />
                <span>Atletas</span>
              </Link>
              
              <Link
                to="/uniforms"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/uniforms')}`}
              >
                <Shirt className="h-5 w-5" />
                <span>Uniformes</span>
              </Link>
              
              <Link
                to="/assignments"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/assignments')}`}
              >
                <Calendar className="h-5 w-5" />
                <span>Atribuições</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;