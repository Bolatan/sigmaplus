import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Building2, Users, Mail, Globe, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

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

// Initial companies data that will be stored in localStorage
const INITIAL_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    website: 'https://acme.example.com',
    email: 'contact@acme.example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 100, New York, NY 10001',
    employeeCount: 250,
    status: 'active',
    createdAt: '2024-01-15T08:00:00.000Z',
    logo: 'https://ui-avatars.com/api/?name=Acme+Corporation&background=random'
  },
  {
    id: '2',
    name: 'Global Industries',
    website: 'https://global.example.com',
    email: 'info@global.example.com',
    phone: '+1 (555) 987-6543',
    address: '456 Enterprise Blvd, Chicago, IL 60601',
    employeeCount: 500,
    status: 'active',
    createdAt: '2024-01-10T08:00:00.000Z',
    logo: 'https://ui-avatars.com/api/?name=Global+Industries&background=random'
  }
];

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
  }, [formData, onFormDataChange]);

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
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    employeeCount: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    try {
      // Load companies from localStorage or use initial data
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        setCompanies(JSON.parse(savedCompanies));
      } else {
        // Initialize with default companies and save to localStorage
        setCompanies(INITIAL_COMPANIES);
        localStorage.setItem('companies', JSON.stringify(INITIAL_COMPANIES));
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setCompanies(INITIAL_COMPANIES);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCompanies = useCallback((updatedCompanies: Company[]) => {
    try {
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
      setCompanies(updatedCompanies);
    } catch (error) {
      console.error('Error saving companies:', error);
    }
  }, []);

  const handleAddCompany = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCompany: Company = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString(),
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      };

      const updatedCompanies = [...companies, newCompany];
      saveCompanies(updatedCompanies);
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding company:', error);
    }
  }, [formData, companies, saveCompanies]);

  const handleEditCompany = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    try {
      const updatedCompany: Company = {
        ...editingCompany,
        ...formData,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      };

      const updatedCompanies = companies.map(company => 
        company.id === editingCompany.id ? updatedCompany : company
      );
      saveCompanies(updatedCompanies);
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating company:', error);
    }
  }, [formData, editingCompany, companies, saveCompanies]);

  const handleDeactivateCompany = useCallback((companyId: string) => {
    const updatedCompanies = companies.map(company =>
      company.id === companyId 
        ? { ...company, status: company.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
        : company
    );
    saveCompanies(updatedCompanies);
  }, [companies, saveCompanies]);

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Company
        </Button>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(company)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={company.status === 'active' ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => handleDeactivateCompany(company.id)}
                    >
                      {company.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
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