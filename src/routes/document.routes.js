const express = require('express');
const router = express.Router();
const {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    shareDocument,
    downloadDocument
} = require('../controllers/document.controller');

const { protect, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');
const { validate } = require('../middleware/validator');
const { documentValidation } = require('../middleware/validator');

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents
 *     description: Retrieve a list of documents. For non-admin users, only shows documents they created or are shared with them.
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of documents per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (e.g., active, archived)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for document name or description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort fields (e.g. name,-createdAt)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       401:
 *         description: Unauthorized
 */
router.route('/')
    .get(protect, getDocuments)
    /**
     * @swagger
     * /api/documents:
     *   post:
     *     summary: Create a new document
     *     description: Create a new document with optional file upload
     *     tags: [Documents]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: Document name
     *               description:
     *                 type: string
     *                 description: Document description
     *               category:
     *                 type: string
     *                 description: Document category
     *               project:
     *                 type: string
     *                 description: Project ID
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Document file
     *               sharedWith:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of user IDs to share with
     *     responses:
     *       201:
     *         description: Document created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Document'
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    .post(
        protect,
        uploadDocument.single('file'),
        validate(documentValidation.create),
        createDocument
    );

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get a single document
 *     description: Get a single document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to access this document
 */
router.route('/:id')
    .get(protect, getDocument)
    /**
     * @swagger
     * /api/documents/{id}:
     *   put:
     *     summary: Update a document
     *     description: Update a document by ID, including optional file upload
     *     tags: [Documents]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Document ID
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: Document name
     *               description:
     *                 type: string
     *                 description: Document description
     *               category:
     *                 type: string
     *                 description: Document category
     *               project:
     *                 type: string
     *                 description: Project ID
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Document file
     *               status:
     *                 type: string
     *                 description: Document status
     *     responses:
     *       200:
     *         description: Document updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Document'
     *       400:
     *         description: Bad request
     *       404:
     *         description: Document not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Not authorized to update this document
     */
    .put(
        protect,
        uploadDocument.single('file'),
        validate(documentValidation.update),
        updateDocument
    )
    /**
     * @swagger
     * /api/documents/{id}:
     *   delete:
     *     summary: Delete a document
     *     description: Delete a document by ID
     *     tags: [Documents]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Document ID
     *     responses:
     *       200:
     *         description: Document deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 message:
     *                   type: string
     *       404:
     *         description: Document not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Not authorized to delete this document
     */
    .delete(protect, deleteDocument);

/**
 * @swagger
 * /api/documents/{id}/share:
 *   put:
 *     summary: Share document with users
 *     description: Share a document with a list of users
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to share with
 *     responses:
 *       200:
 *         description: Document shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to share this document
 */
router.route('/:id/share')
    .put(protect, shareDocument);

/**
 * @swagger
 * /api/documents/{id}/download:
 *   get:
 *     summary: Download document
 *     description: Download the file associated with a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request
 *       404:
 *         description: Document or file not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to download this document
 */
router.route('/:id/download')
    .get(protect, downloadDocument);

module.exports = router; 