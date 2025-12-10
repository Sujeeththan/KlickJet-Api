import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Validate configuration first
const validateConfig = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (!secretKey) {
    console.error(' Stripe configuration error: STRIPE_SECRET_KEY is missing');
    console.error(' Please add STRIPE_SECRET_KEY to your .env file');
    console.error('   Example: STRIPE_SECRET_KEY=sk_test_...');
    console.warn(' Stripe payment processing will be disabled until configured');
    return false;
  }
  
  if (!publishableKey) {
    console.warn(' Stripe warning: STRIPE_PUBLISHABLE_KEY is missing');
    console.warn('This is needed for frontend integration');
  }
  
  // Validate key format
  if (!secretKey.startsWith('sk_')) {
    console.error(' Stripe configuration error: Invalid secret key format');
    console.error('Secret key should start with "sk_test_" or "sk_live_"');
    return false;
  }
  
  const environment = secretKey.startsWith('sk_test_') ? 'TEST' : 'LIVE';
  console.log(' Stripe configured successfully');
  console.log(`   Environment: ${environment} mode`);
  console.log(`   Secret Key: ${secretKey.substring(0, 12)}...`);
  
  return true;
};

// Validate and conditionally initialize Stripe
const isConfigured = validateConfig();
let stripe = null;

if (isConfigured && process.env.STRIPE_SECRET_KEY) {
  // Initialize Stripe only if the secret key is available
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Use latest stable API version
  });
}

// Export both the stripe instance and publishable key getter
export default stripe;

export const getPublishableKey = () => process.env.STRIPE_PUBLISHABLE_KEY;

export const isStripeConfigured = () => isConfigured;
