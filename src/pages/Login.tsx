import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import logo from '/logo.png';

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <img src={logo} alt="Logo" className="w-32 h-32" />
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;