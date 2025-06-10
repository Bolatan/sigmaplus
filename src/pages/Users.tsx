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

// Mock users data that will be stored in localStorage
const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    avatar: 'https://i.pravatar.cc/150?img=1',
    createdAt: '2024-01-01T08:00:00.000Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Agent User',
    email: 'agent@example.com',
    role: UserRole.AGENT,
    avatar: 'https://i.pravatar.cc/150?img=2',
    createdAt: '2024-01-05T08:00:00.000Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Client User',
    email: 'client@example.com',
    role: UserRole.CLIENT,
    companyId: '1',
    avatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: '2024-01-10T08:00:00.000Z',
    status: 'active'
  },
  {
    id: '4',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: UserRole.CLIENT,
    companyId: '1',
    avatar: 'https://i.pravatar.cc/150?img=4',
    createdAt: '2024-01-15T08:00:00.000Z',
    status: 'active'
  },
  {
    id: '5',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: UserRole.AGENT,
    avatar: 'https://i.pravatar.cc/150?img=5',
    createdAt: '2024-01-20T08:00:00.000Z',
    status: 'active'
  }
];

// Separate UserForm component to prevent re-renders
const UserForm: React.FC<{
  formData: {
    name: string;
    email: string;
    role: UserRole;
    companyId: string;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  buttonText: string;
}> = React.memo(({ formData, onFormDataChange, onSubmit, onCancel, buttonText }) => {
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
      {formData.role === UserRole.CLIENT && (
        <Input
          label="Company ID"
          value={formData.companyId}
          onChange={(e) => handleInputChange('companyId', e.target.value)}
          required
        />
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.CLIENT,
    companyId: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      // Load users from localStorage or use initial data
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        // Initialize with default users and save to localStorage
        setUsers(INITIAL_USERS);
        localStorage.setItem('users', JSON.stringify(INITIAL_USERS));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(INITIAL_USERS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsers = useCallback((updatedUsers: User[]) => {
    try {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }, []);

  const handleAddUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      };

      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }, [formData, users, saveUsers]);

  const handleEditUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updatedUser: User = {
        ...editingUser,
        ...formData,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      };

      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? updatedUser : user
      );
      saveUsers(updatedUsers);
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, [formData, editingUser, users, saveUsers]);

  const handleDeactivateUser = useCallback((userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
        : user
    );
    saveUsers(updatedUsers);
  }, [users, saveUsers]);

  const startEdit = useCallback((user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId || '',
    });
    setIsEditModalOpen(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      role: UserRole.CLIENT,
      companyId: '',
    });
    setEditingUser(null);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Button
          variant="primary"
          leftIcon={<UserPlus className="h-5 w-5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add User
        </Button>
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
                  onClick={() => handleDeactivateUser(user.id)}
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
          onFormDataChange={handleFormDataChange}
          onSubmit={handleEditUser}
          onCancel={handleCancelEdit}
          buttonText="Save Changes"
        />
      </Modal>

      {filteredUsers.length === 0 && (
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