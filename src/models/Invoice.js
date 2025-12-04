const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - invoiceNumber
 *         - client
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the invoice
 *         invoiceNumber:
 *           type: string
 *           description: Unique invoice number
 *         client:
 *           type: string
 *           description: Client ID the invoice belongs to
 *         project:
 *           type: string
 *           description: Project ID the invoice belongs to (optional)
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               rate:
 *                 type: number
 *               amount:
 *                 type: number
 *               task:
 *                 type: string
 *           description: Line items on the invoice
 *         amount:
 *           type: number
 *           description: Total invoice amount
 *         tax:
 *           type: number
 *           description: Tax amount
 *         status:
 *           type: string
 *           enum: [draft, sent, paid, cancelled, overdue]
 *           description: Status of the invoice
 *         issueDate:
 *           type: string
 *           format: date
 *           description: Date the invoice was issued
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Due date for payment
 *         paidDate:
 *           type: string
 *           format: date
 *           description: Date the invoice was paid (if applicable)
 *         notes:
 *           type: string
 *           description: Additional notes on the invoice
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the invoice was created
 *       example:
 *         invoiceNumber: INV-2023-0001
 *         client: 60d0fe4f5311236168a109ca
 *         project: 60d0fe4f5311236168a109cb
 *         items:
 *           - description: Financial Statement Preparation
 *             quantity: 10
 *             rate: 150
 *             amount: 1500
 *             task: 60d0fe4f5311236168a109cc
 *         amount: 1500
 *         tax: 150
 *         status: sent
 *         issueDate: 2023-04-01
 *         dueDate: 2023-04-30
 */

const InvoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add a quantity'],
        min: [0, 'Quantity cannot be negative']
    },
    rate: {
        type: Number,
        required: [true, 'Please add a rate'],
        min: [0, 'Rate cannot be negative']
    },
    amount: {
        type: Number,
        min: [0, 'Amount cannot be negative']
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }
});

// Calculate amount before saving
InvoiceItemSchema.pre('save', function (next) {
    this.amount = this.quantity * this.rate;
    next();
});

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: [true, 'Please add an invoice number'],
        unique: true,
        trim: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Please add a client']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: [true, 'Please add a due date']
    },
    items: [InvoiceItemSchema],
    subtotal: {
        type: Number,
        min: [0, 'Subtotal cannot be negative']
    },
    taxRate: {
        type: Number,
        default: 0,
        min: [0, 'Tax rate cannot be negative'],
        max: [100, 'Tax rate cannot exceed 100%']
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: [0, 'Tax amount cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    total: {
        type: Number,
        min: [0, 'Total cannot be negative']
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },
    notes: {
        type: String,
        trim: true
    },
    terms: {
        type: String,
        trim: true
    },
    sentDate: {
        type: Date
    },
    paidDate: {
        type: Date
    },
    paidAmount: {
        type: Number,
        min: [0, 'Paid amount cannot be negative']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Calculate subtotal, tax and total before saving
InvoiceSchema.pre('save', function (next) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((acc, item) => acc + item.amount, 0);

    // Calculate tax amount
    this.taxAmount = this.subtotal * (this.taxRate / 100);

    // Calculate total
    this.total = this.subtotal + this.taxAmount - this.discount;

    next();
});

// Auto-set status to overdue if past due date
InvoiceSchema.pre('save', function (next) {
    if (this.status === 'sent' && this.dueDate < new Date() && !this.isNew) {
        this.status = 'overdue';
    }
    next();
});

// Virtual for payment status (fully paid, partially paid, unpaid)
InvoiceSchema.virtual('paymentStatus').get(function () {
    if (!this.paidAmount || this.paidAmount === 0) return 'unpaid';
    if (this.paidAmount < this.total) return 'partially paid';
    return 'fully paid';
});

// Virtual for overdue days
InvoiceSchema.virtual('overdueDays').get(function () {
    if (this.status !== 'overdue' && this.status !== 'sent') return 0;

    const today = new Date();
    const dueDate = new Date(this.dueDate);

    if (dueDate > today) return 0;

    const diffTime = Math.abs(today - dueDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index for faster queries
InvoiceSchema.index({ client: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema); 