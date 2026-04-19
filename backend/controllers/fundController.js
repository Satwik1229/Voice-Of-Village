const db = require('../config/db');

// Upload a new fund document
const uploadDocument = async (req, res) => {
  const { title, description, financial_year, category } = req.body;
  const uploaded_by = req.user.id;
  const document_url = req.file ? req.file.filename : null;

  if (req.user.role !== 'admin' && req.user.role !== 'sarpanch') {
    return res.status(403).json({ message: 'Only admin or sarpanch can upload documents' });
  }

  if (!title || !document_url) {
    return res.status(400).json({ message: 'Title and file are required' });
  }

  try {
    await db.query(
      'INSERT INTO fund_documents (title, description, document_url, uploaded_by, financial_year, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, document_url, uploaded_by, financial_year, category || 'other']
    );
    res.status(201).json({ message: 'Document uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading document', error: err.message });
  }
};

// Get all fund documents
const getAllDocuments = async (req, res) => {
  try {
    const [documents] = await db.query(`
      SELECT fund_documents.*, users.name as uploader_name 
      FROM fund_documents 
      JOIN users ON fund_documents.uploaded_by = users.id 
      ORDER BY fund_documents.created_at DESC
    `);
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
};

// Delete a document (Admin only)
const deleteDocument = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user.role !== 'sarpanch') {
    return res.status(403).json({ message: 'Only admin or sarpanch can delete documents' });
  }

  try {
    await db.query('DELETE FROM fund_documents WHERE id = ?', [id]);
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting document', error: err.message });
  }
};

module.exports = { uploadDocument, getAllDocuments, deleteDocument };
