import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-700">Signa Plus</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your marketing research dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;