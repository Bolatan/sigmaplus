import multer from 'multer';

// Multer configuration for file uploads (using memory storage)
const storage = multer.memoryStorage(); // Stores file in memory as Buffer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => { // Basic CSV filter
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are allowed!'), false);
    }
  }
});

export default upload;
