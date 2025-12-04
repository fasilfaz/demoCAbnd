// Vercel serverless function entrypoint
require('dotenv').config();
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

// Export the Express app as the handler for Vercel Serverless Functions
module.exports = async (req, res) => {
	// Ensure DB connection for this invocation (connectDB is idempotent)
	try {
		await connectDB();
	} catch (err) {
		console.error('Failed to connect to DB in serverless function:', err);
		return res.status(500).json({ error: 'Database connection error' });
	}

	return app(req, res);
};
