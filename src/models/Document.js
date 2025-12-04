const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       required:
 *         - name
 *         - fileUrl
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the document
 *         name:
 *           type: string
 *           description: Name of the document
 *         description:
 *           type: string
 *           description: Description of the document
 *         fileUrl:
 *           type: string
 *           description: URL or path to the document file
 *         fileType:
 *           type: string
 *           description: Type of file (PDF, DOCX, etc.)
 *         fileSize:
 *           type: number
 *           description: Size of the file in bytes
 *         category:
 *           type: string
 *           enum: [financial, legal, compliance, tax, general]
 *           description: Category of the document
 *         project:
 *           type: string
 *           description: Project ID the document belongs to (optional)
 *         task:
 *           type: string
 *           description: Task ID the document belongs to (optional)
 *         client:
 *           type: string
 *           description: Client ID the document belongs to (optional)
 *         uploadedBy:
 *           type: string
 *           description: User ID of the person who uploaded the document
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the document was created
 *       example:
 *         name: Q1-2023-Financial-Statements.pdf
 *         description: Q1 2023 Financial Statements for XYZ Corp
 *         fileUrl: /uploads/documents/Q1-2023-Financial-Statements.pdf
 *         fileType: application/pdf
 *         fileSize: 2048576
 *         category: financial
 *         project: 60d0fe4f5311236168a109ca
 *         uploadedBy: 60d0fe4f5311236168a109cb
 */

const DocumentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a document name'],
            trim: true,
            maxlength: [100, 'Document name cannot be more than 100 characters'],
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        fileUrl: {
            type: String,
            required: [true, 'Please add a file URL'],
        },
        fileType: {
            type: String,
        },
        fileSize: {
            type: Number,
        },
        category: {
            type: String,
            enum: ['financial', 'legal', 'compliance', 'tax', 'general'],
            default: 'general',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please specify the user who uploaded this document'],
        },
        sharedWith: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
           
        },
        tags: [String],
        isArchived: {
            type: Boolean,
            default: false,
        },
        deleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Update project and task references when a document is created
DocumentSchema.post('save', async function () {
    // Add document reference to project if it belongs to a project
    if (this.project) {
        await this.model('Project').findByIdAndUpdate(
            this.project,
            { $addToSet: { documents: this._id } },
            { new: true }
        );
    }

    // Add document reference to task if it belongs to a task
    if (this.task) {
        await this.model('Task').findByIdAndUpdate(
            this.task,
            { $addToSet: { attachments: this._id } },
            { new: true }
        );
    }
});

module.exports = mongoose.model('Document', DocumentSchema);