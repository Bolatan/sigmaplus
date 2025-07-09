import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, UserPlus, Mail, Building2, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

// Separate UserForm component to prevent re-renders
const UserForm: React.FC<{
  formData: {
    name: string;
    email: string;
    role: UserRole;
    companyId: string;
    password?: string; // Optional for edit mode
    confirmPassword?: string; // Optional for edit mode
  };
  isEditMode: boolean; // To conditionally show password fields
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  buttonText: string;
}> = React.memo(({ formData, isEditMode, onFormDataChange, onSubmit, onCancel, buttonText }) => {
  const handleInputChange = useCallback((field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  }, [formData, onFormDataChange]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        required
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        required
        disabled={isEditMode} // Email typically not editable after creation
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          value={formData.role}
          onChange={(e) => handleInputChange('role', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          required
        >
          <option value={UserRole.CLIENT}>Client</option>
          <option value={UserRole.AGENT}>Agent</option>
          <option value={UserRole.ADMIN}>Admin</option>
        </select>
      </div>
      {/* Company ID might be relevant for agent/client roles */}
      {(formData.role === UserRole.CLIENT || formData.role === UserRole.AGENT) && (
        <Input
          label="Company ID (Optional)"
          value={formData.companyId}
          onChange={(e) => handleInputChange('companyId', e.target.value)}
          placeholder="Enter valid Company ObjectId"
        />
      )}
      {!isEditMode && ( // Password fields only for Add User mode
        <>
          <Input
            label="Password"
            type="password"
            value={formData.password || ''}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            minLength={6}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword || ''}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
          />
        </>
      )}
      <div className="flex justify-end space-x-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
});

UserForm.displayName = 'UserForm';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { user: loggedInUser } = useAuth();

  // Add password and confirmPassword to formData state for the add user form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.CLIENT,
    companyId: '',
    password: '',
    confirmPassword: '',
  });

  // Move resetForm before it's used in other functions
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      role: UserRole.CLIENT,
      companyId: '',
      password: '', // Reset password fields too
      confirmPassword: '',
    });
    setEditingUser(null);
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setApiError("No authentication token found. Please login.");
      setIsLoading(false);
      setUsers([]);
      return;
    }

    if (loggedInUser?.role !== UserRole.ADMIN) {
      setApiError("Access Denied: You do not have permission to view users.");
      setIsLoading(false);
      setUsers([]);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = `Error fetching users: ${response.statusText}`;
        if (response.status === 401 || response.status === 403) {
          try {
            const errorData = await response.json();
            errorMsg = errorData.msg || errorData.error || errorMsg;
          } catch (e) { /* ignore */ }
        }
        setApiError(errorMsg);
        throw new Error(errorMsg);
      }

      const result = await response.json();
      const fetchedUsers = (result.data || []).map((u: any) => ({
        ...u,
        id: u._id,
        status: u.status || 'inactive',
        createdAt: u.createdAt || new Date().toISOString(),
      }));
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error('Error fetching users from API:', error);
      if (!apiError) {
        setApiError(error.message || 'Failed to fetch users. Please try again.');
      }
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [loggedInUser, apiError]);

  // This useEffect handles initial data fetch and re-fetch on user change.
  useEffect(() => {
    if (loggedInUser && loggedInUser.role === UserRole.ADMIN) {
      fetchUsers();
    } else if (loggedInUser && loggedInUser.role !== UserRole.ADMIN) {
      setApiError("Access Denied: You do not have permission to view users.");
      setIsLoading(false);
      setUsers([]);
    } else if (!loggedInUser && !localStorage.getItem('authToken')) {
      setApiError("No authentication token found. Please login.");
      setIsLoading(false);
      setUsers([]);
    }
  }, [loggedInUser, fetchUsers]);

  const handleAddUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setApiError("Authentication required.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setApiError("Passwords do not match.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setApiError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          companyId: formData.companyId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to add user: ${response.statusText}`);
      }

      await fetchUsers();
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error adding user via API:', error);
      setApiError(error.message || 'An unexpected error occurred while adding the user.');
    }
  }, [formData, resetForm, fetchUsers]);

  const handleEditUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.id) {
      setApiError("No user selected for editing or user ID is missing.");
      return;
    }
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required.");
      return;
    }

    const payload: any = {
      name: formData.name,
      role: formData.role,
    };
    
    if (formData.companyId !== undefined) {
      payload.companyId = formData.companyId === '' ? null : formData.companyId;
    }

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update user: ${response.statusText}`);
      }

      const updatedUserFromApi = await response.json();
      const updatedUser = {
        ...(updatedUserFromApi.data || updatedUserFromApi),
        id: (updatedUserFromApi.data || updatedUserFromApi)._id,
      };

      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
      );
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error updating user via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating the user.');
    }
  }, [formData, editingUser, resetForm]);

  const handleToggleUserStatus = useCallback(async (userId: string, currentStatus: 'active' | 'inactive') => {
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required.");
      return;
    }

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const originalUsers = [...users];

    // Optimistic UI update
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, status: newStatus, avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random` } : u
      )
    );

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setUsers(originalUsers);
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update user status: ${response.statusText}`);
      }

      const updatedUserFromApi = await response.json();
      const finalUpdatedUser = {
        ...(updatedUserFromApi.data || updatedUserFromApi),
        id: (updatedUserFromApi.data || updatedUserFromApi)._id,
      };
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === finalUpdatedUser.id ? { ...u, ...finalUpdatedUser, avatar: u.avatar } : u))
      );

    } catch (error: any) {
      console.error('Error updating user status via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating user status.');
      setUsers(originalUsers);
    }
  }, [users]);

  const startEdit = useCallback((user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId || '',
      password: '', // Don't populate password fields in edit mode
      confirmPassword: '',
    });
    setIsEditModalOpen(true);
  }, []);

  const handleFormDataChange = useCallback((newFormData: any) => {
    setFormData(newFormData);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setIsAddModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleCancelEdit = useCallback(() => {
    setIsEditModalOpen(false);
    resetForm();
  }, [resetForm]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-primary-100 text-primary-800';
      case UserRole.AGENT:
        return 'bg-secondary-100 text-secondary-800';
      case UserRole.CLIENT:
        return 'bg-accent-100 text-accent-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-success-100 text-success-800' 
      : 'bg-error-100 text-error-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{apiError}</p>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        {loggedInUser?.role === UserRole.ADMIN && (
          <Button
            variant="primary"
            leftIcon={<UserPlus className="h-5 w-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add User
          </Button>
        )}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <Button
          variant="outline"
          leftIcon={<Filter className="h-5 w-5" />}
        >
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </div>
                  {user.companyId && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      Company ID: {user.companyId}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getRoleBadgeColor(user.role)}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(user)}
                >
                  Edit
                </Button>
                <Button
                  variant={user.status === 'active' ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={() => handleToggleUserStatus(user.id, user.status)}
                >
                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCancelAdd}
        title="Add New User"
      >
        <UserForm
          formData={formData}
          isEditMode={false}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleAddUser}
          onCancel={handleCancelAdd}
          buttonText="Add User"
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Edit User"
      >
        <UserForm
          formData={formData}
          isEditMode={true}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleEditUser}
          onCancel={handleCancelEdit}
          buttonText="Save Changes"
        />
      </Modal>

      {filteredUsers.length === 0 && !isLoading && !apiError && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <UserPlus className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first user to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
