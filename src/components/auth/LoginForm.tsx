import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Email"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
          required
          fullWidth
        />
      </div>
      <div>
        <Input
          label="Password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          required
          fullWidth
        />
      </div>
      {error && <p className="text-error-600 text-sm">{error}</p>}
      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          rightIcon={<LogIn className="h-4 w-4" />}
        >
          Sign in
        </Button>
      </div>
      <div className="text-center text-sm text-gray-500">
        <p>Demo credentials:</p>
        <ul className="mt-1 space-y-1">
          <li>Admin: admin@example.com / password</li>
          <li>Agent: agent@example.com / password</li>
          <li>Client: client@example.com / password</li>
        </ul>
      </div>
    </form>
  );
};