require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the Plan Schema and Model
const PlanSchema = new mongoose.Schema({
  businessName: String,
  industry: String,
  plan: String,
  createdAt: { type: Date, default: Date.now }
});

const Plan = mongoose.model('Plan', PlanSchema);

// Route to generate and save or update business plan
app.post('/generate-plan', async (req, res) => {
  const { businessName, industry } = req.body;

  // Log the received request body for debugging
  console.log('Received request:', req.body);

  if (!businessName || !industry) {
    return res.status(400).send('Missing businessName or industry');
  }

  try {
    console.log('Sending request to OpenRouter API...');
    console.log('API Key:', process.env.OPENROUTER_API_KEY); // Debug API key

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'deepseek/deepseek-r1:free',
      messages: [
        {
          role: 'user',
          content: `Create a business plan for ${businessName} in the ${industry} industry.`
        }
      ],
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': '<YOUR_SITE_URL>', // Optional
        'X-Title': '<YOUR_SITE_NAME>' // Optional
      }
    });

    // Log the full API response to debug the structure
    console.log('API Response:', JSON.stringify(response.data, null, 2));

    // Extract plan text with fallback to reasoning
    let planText = '';
    if (response.data.choices && response.data.choices.length > 0) {
      planText = response.data.choices[0].message?.content || 
                 response.data.choices[0].message?.reasoning || 
                 response.data.choices[0].text || '';
    } else {
      console.log('No choices found in API response');
    }

    console.log('Extracted Plan Text:', planText); // Debug extracted text
    if (!planText) {
      throw new Error('No valid plan text returned from API');
    }

    // Check if a plan already exists for this businessName and industry
    let plan = await Plan.findOne({ businessName, industry });
    if (plan) {
      // Update existing plan
      plan.plan = planText;
      await plan.save();
      console.log('Plan updated in MongoDB:', plan);
    } else {
      // Create new plan
      plan = new Plan({ businessName, industry, plan: planText });
      await plan.save();
      console.log('Plan saved:', plan);
    }

    res.json({ plan: planText });
  } catch (error) {
    console.error('Error Details:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    res.status(500).send('Error generating or updating business plan');
  }
});

// New route to fetch all plans
app.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).send('Error fetching plans');
  }
});

// Example route
app.get('/', (req, res) => {
  res.send('Welcome to the Business Plan Generator!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
