import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Building2, Users, Mail, Globe, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';

interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  email: string;
  phone: string;
  address: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Separate CompanyForm component to prevent re-renders
const CompanyForm: React.FC<{
  formData: {
    name: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    employeeCount: number;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  buttonText: string;
}> = React.memo(({ formData, onFormDataChange, onSubmit, onCancel, buttonText }) => {

  const handleInputChange = useCallback((field: string, value: string | number) => {
    onFormDataChange({ ...formData, [field]: value });
  }, [formData, onFormDataChange]); // Dependencies are correct

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Company Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        required
      />
      <Input
        label="Website"
        type="url"
        value={formData.website}
        onChange={(e) => handleInputChange('website', e.target.value)}
        placeholder="https://"
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        required
      />
      <Input
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        required
      />
      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => handleInputChange('address', e.target.value)}
        required
      />
      <Input
        label="Number of Employees"
        type="number"
        value={formData.employeeCount}
        onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value) || 0)}
        required
        min="1"
      />
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

CompanyForm.displayName = 'CompanyForm';

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    employeeCount: 0
  });
  const { user: loggedInUser } = useAuth();
  const apiFetch = useApi();
  const [apiError, setApiError] = useState<string | null>(null);

  // Moved resetForm to the top, before other functions that might use it
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      employeeCount: 0
    });
    setEditingCompany(null);
  }, []); // Empty dependency array as it doesn't rely on external scope values

  // handleFormDataChange also depends on setFormData which is stable
  const handleFormDataChange = useCallback((newFormData: any) => {
    setFormData(newFormData);
  }, []);

  // Optimized fetchCompanies useCallback
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await apiFetch('/companies');
      const fetchedCompanies = (result.data || []).map((c: any) => ({
        ...c,
        id: c._id,
        logo: c.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
      }));
      setCompanies(fetchedCompanies);
    } catch (error: any) {
      console.error('Error fetching companies from API:', error);
      setApiError(error.message || 'Failed to fetch companies. Please try again.');
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  // Simplified useEffect for initial data fetch
  useEffect(() => {
    if (loggedInUser) {
      fetchCompanies();
    } else if (!localStorage.getItem('authToken')) {
      setApiError("Please login to view companies.");
      setIsLoading(false);
      setCompanies([]);
    }
  }, [loggedInUser, fetchCompanies]); // Dependencies are correct

  const handleAddCompany = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setApiError("Name, Email, Phone, and Address are required.");
      return;
    }
    if (formData.employeeCount < 0) {
      setApiError("Employee count cannot be negative.");
      return;
    }

    try {
      await apiFetch('/companies', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      await fetchCompanies();
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error adding company via API:', error);
      setApiError(error.message || 'An unexpected error occurred while adding the company.');
    }
  }, [formData, resetForm, fetchCompanies, apiFetch]);

  const handleEditCompany = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editingCompany.id) {
      setApiError("No company selected for editing or company ID is missing.");
      return;
    }
    setApiError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setApiError("Name, Email, Phone, and Address are required for editing.");
      return;
    }
    if (formData.employeeCount < 0) {
      setApiError("Employee count cannot be negative.");
      return;
    }

    try {
      await apiFetch(`/companies/${editingCompany.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      await fetchCompanies();
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error updating company via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating the company.');
    }
  }, [formData, editingCompany, resetForm, fetchCompanies, apiFetch]);

  const handleToggleCompanyStatus = useCallback(async (companyId: string, currentStatus: 'active' | 'inactive') => {
    setApiError(null);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const originalCompanies = [...companies];

    setCompanies(prevCompanies =>
      prevCompanies.map(c =>
        c.id === companyId ? { ...c, status: newStatus } : c
      )
    );

    try {
      await apiFetch(`/companies/${companyId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchCompanies();
    } catch (error: any) {
      console.error('Error updating company status via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating company status.');
      setCompanies(originalCompanies);
    }
  }, [companies, fetchCompanies, apiFetch]);

  const startEdit = useCallback((company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      website: company.website || '',
      email: company.email,
      phone: company.phone,
      address: company.address,
      employeeCount: company.employeeCount
    });
    setIsEditModalOpen(true);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setIsAddModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleCancelEdit = useCallback(() => {
    setIsEditModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleDeleteCompany = useCallback(async () => {
    if (!deletingCompany) return;
    setApiError(null);

    try {
      await apiFetch(`/companies/${deletingCompany.id}`, {
        method: 'DELETE',
      });
      setCompanies(prev => prev.filter(c => c.id !== deletingCompany.id));
      handleCancelDelete();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      setApiError(error.message || 'Failed to delete company.');
    }
  }, [deletingCompany, apiFetch, handleCancelDelete]);

  const openDeleteModal = useCallback((company: Company) => {
    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingCompany(null);
    setApiError(null);
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        {/* Add Company button might be role-restricted, e.g., admin only */}
        {loggedInUser?.role === 'admin' && (
            <Button
              variant="primary"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Company
            </Button>
        )}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search companies..."
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
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-12 w-12 rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {company.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                      {company.status}
                    </span>
                  </div>

                  <div className="mt-2 space-y-2 text-sm text-gray-500">
                    {company.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        <a href={company.website} className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          {company.website.replace('https://', '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${company.email}`} className="hover:text-gray-700">
                        {company.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{company.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{company.employeeCount} employees</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Added {formatDate(company.createdAt)}
                  </span>
                  <div className="space-x-2">
                    {loggedInUser?.role === 'admin' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(company)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(company)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCancelAdd}
        title="Add New Company"
      >
        <CompanyForm
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleAddCompany}
          onCancel={handleCancelAdd}
          buttonText="Add Company"
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Edit Company"
      >
        <CompanyForm
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleEditCompany}
          onCancel={handleCancelEdit}
          buttonText="Save Changes"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingCompany && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title="Confirm Deletion"
        >
          <div className="space-y-4">
            <p>Are you sure you want to delete the company <strong>{deletingCompany.name}</strong>? This action cannot be undone.</p>
            {apiError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert">
                <p>{apiError}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDeleteCompany}>
                Delete Company
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No companies found
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first company to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Companies;
