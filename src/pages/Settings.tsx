import React, { useState } from 'react';
import { Save, User, Mail, Lock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const apiFetch = useApi();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.companyId || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [branding, setBranding] = useState({
    logo: null,
    color: '#000000',
  });

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'logo') {
      // @ts-ignore
      setBranding({ ...branding, logo: e.target.files[0] });
    } else {
      setBranding({ ...branding, [e.target.name]: e.target.value });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement settings update logic
    console.log('Settings updated:', formData);

    if (user?.role === 'admin' && user.companyId) {
      if (branding.logo) {
        // In a real app, you'd upload the logo to a file storage service
        // and get back a URL to save in the database.
        // For now, we'll just log a message.
        console.log('Logo would be uploaded here.');
      }

      try {
        await apiFetch(`/companies/${user.companyId}/branding`, {
          method: 'PUT',
          body: JSON.stringify({ color: branding.color }),
        });
        console.log('Branding updated successfully');
      } catch (error) {
        console.error('Failed to update branding', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
            />
            {user?.role === 'client' && (
              <Input
                label="Company ID"
                name="company"
                value={formData.company}
                onChange={handleChange}
                leftIcon={<Building2 className="h-5 w-5 text-gray-400" />}
                disabled
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            />
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Company Logo
              </label>
              <div className="mt-1">
                <input type="file" name="logo" id="logo" onChange={handleBrandingChange} />
              </div>
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Report Color Scheme
              </label>
              <div className="mt-1">
                <input type="color" name="color" id="color" value={branding.color} onChange={handleBrandingChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save className="h-5 w-5" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;