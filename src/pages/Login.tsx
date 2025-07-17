import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import logo from '/logo.png';

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <img src={logo} alt="Logo" className="w-32 h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Major SurveyMonkey Functions</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Survey Builder: Intuitive drag-and-drop interface</li>
              <li>Question Types: Multiple choice, star rating, ranking, etc.</li>
              <li>AI-Powered Survey Creation: Build surveys in seconds</li>
              <li>Logic & Branching: Create dynamic surveys</li>
              <li>Advanced Analytics: Real-time results and interactive reports</li>
              <li>Multiple Distribution Channels: Email, social media, QR codes</li>
              <li>Collaboration & Team Features: Share and collaborate on surveys</li>
              <li>Market Research Tools: Access global survey panels</li>
            </ul>
          </div>
          <div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;