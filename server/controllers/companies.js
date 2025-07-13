import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { ApiError } from '../utils/ApiError.js'; // Assuming you have this utility

// Controller to create a new company
export const createCompany = async (req, res, next) => {
  try {
    const { name, website, email, phone, address, employeeCount, status = 'active' } = req.body;
    const { id: userId } = req.user; // Assuming admin/agent creating this might be logged

    // Basic validation already done by express-validator in routes
    // More complex business logic validation can be here

    const db = getDb();

    const newCompanyDocument = {
      name,
      website: website || null,
      email,
      phone,
      address,
      employeeCount: parseInt(String(employeeCount), 10) || 0,
      status, // 'active' or 'inactive'
      createdBy: new ObjectId(userId), // Track who created it
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('companies').insertOne(newCompanyDocument);
    // Fetch the created document to return it fully populated
    const createdCompany = await db.collection('companies').findOne({ _id: result.insertedId });

    res.status(201).json({ status: 'success', data: createdCompany });

  } catch (err) {
    console.error("Error in createCompany controller:", err);
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(500, err.message || 'Failed to create company.'));
  }
};

// Controller to get all companies
export const getCompanies = async (req, res, next) => {
  try {
    const db = getDb();
    const companies = await db.collection('companies').find({}).toArray();
    res.json({ data: companies });
  } catch (err) {
    console.error("Failed to fetch companies:", err);
    next(new ApiError(500, "Failed to fetch companies from database"));
  }
};

// Controller to get a single company by ID
export const getCompanyById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const db = getDb();
    if (!ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid company ID format"));
    }
    const company = await db.collection('companies').findOne({ _id: new ObjectId(id) });
    if (!company) {
      return next(new ApiError(404, "Company not found"));
    }
    res.json({ data: company });
  } catch (err) {
    console.error("Failed to fetch company:", err);
    next(new ApiError(500, "Failed to fetch company from database"));
  }
};

// Controller to update a company
export const updateCompany = async (req, res, next) => {
  const { id: companyId } = req.params;
  const { name, website, email, phone, address, employeeCount, status } = req.body;

  if (!ObjectId.isValid(companyId)) {
    return next(new ApiError(400, "Invalid company ID format."));
  }

  try {
    const db = getDb();
    const updateFields = {};

    if (name !== undefined) updateFields.name = String(name).trim();
    if (website !== undefined) updateFields.website = website;
    if (email !== undefined) updateFields.email = email; // Add email validation in route
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (employeeCount !== undefined) updateFields.employeeCount = parseInt(String(employeeCount), 10) || 0;
    if (status !== undefined) updateFields.status = status; // Add status validation in route

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ errors: [{ msg: 'No valid fields provided for update.' }] });
    }
    updateFields.updatedAt = new Date();

    const result = await db.collection('companies').findOneAndUpdate(
      { _id: new ObjectId(companyId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return next(new ApiError(404, 'Company not found.'));
    }
    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error(`Error in updateCompany controller for companyId ${companyId}:`, err);
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(500, err.message || 'Server error while updating company.'));
  }
};


// Controller to delete a company
export const deleteCompany = async (req, res, next) => {
  const { id: companyId } = req.params;

  if (!ObjectId.isValid(companyId)) {
    return next(new ApiError(400, "Invalid company ID format."));
  }
  try {
    const db = getDb();
    const result = await db.collection('companies').deleteOne({ _id: new ObjectId(companyId) });

    if (result.deletedCount === 0) {
      return next(new ApiError(404, 'Company not found or already deleted.'));
    }
    res.status(200).json({ status: 'success', message: 'Company deleted successfully' });
  } catch (err) {
    console.error(`Error in deleteCompany controller for companyId ${companyId}:`, err);
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(500, err.message || 'Server error while deleting company.'));
  }
};

// Controller to update a company's branding
export const updateCompanyBranding = async (req, res, next) => {
  const { id: companyId } = req.params;
  const { logo, color } = req.body;

  if (!ObjectId.isValid(companyId)) {
    return next(new ApiError(400, "Invalid company ID format."));
  }

  try {
    const db = getDb();
    const updateFields = {};

    if (logo) updateFields['branding.logo'] = logo;
    if (color) updateFields['branding.color'] = color;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ errors: [{ msg: 'No valid fields provided for update.' }] });
    }
    updateFields.updatedAt = new Date();

    const result = await db.collection('companies').findOneAndUpdate(
      { _id: new ObjectId(companyId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return next(new ApiError(404, 'Company not found.'));
    }
    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error(`Error in updateCompanyBranding controller for companyId ${companyId}:`, err);
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(500, err.message || 'Server error while updating company branding.'));
  }
};
