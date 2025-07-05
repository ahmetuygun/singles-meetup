# Stripe Configuration Setup

## 🔧 Local Development Setup

### Step 1: Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. **Make sure you're in "Test Mode"** (toggle in top-left)
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### Step 2: Update Configuration Files

**For Development (`src/main/resources/config/application-dev.yml`):**
```yaml
stripe:
  secret-key: sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
  publishable-key: pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
  webhook-secret: whsec_test_YOUR_WEBHOOK_SECRET_HERE
```

**For Production (`src/main/resources/config/application-prod.yml`):**
```yaml
stripe:
  secret-key: sk_live_YOUR_LIVE_SECRET_KEY_HERE
  publishable-key: pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
  webhook-secret: whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
```

## 🚨 Security Notes

- **NEVER commit real Stripe keys to Git**
- Use test keys (`sk_test_` and `pk_test_`) during development
- Use live keys (`sk_live_` and `pk_live_`) only in production
- Consider using environment variables for production deployments

## 🧪 Testing Payments

### Test Card Numbers
- **Visa**: `4242 4242 4242 4242`
- **Visa (debit)**: `4000 0566 5566 5556`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`
- **Declined**: `4000 0000 0000 0002`

### Test Details
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3-digit number (e.g., `123`)
- **ZIP**: Any 5-digit number (e.g., `12345`)

## 📊 Viewing Test Payments

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Switch to "Test Mode"** (top-left toggle)
3. Navigate to **"Payments"** in the sidebar
4. Your test payments will appear here

## 🔗 Webhook Setup (Optional)

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events: 
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.requires_action`
   - `payment_intent.canceled`
4. Copy the webhook secret and update configuration

## 📱 Mobile Payments

### Apple Pay
- Works on Safari (iOS/macOS)
- Requires HTTPS in production
- Test on actual iOS devices

### Google Pay
- Works on Chrome/Android
- Requires HTTPS in production
- Test on actual Android devices

## 🔧 Troubleshooting

### Common Issues

1. **"Stripe not loading"**
   - Check network connection
   - Verify publishable key is correct
   - Check browser console for errors

2. **"Payment method not available"**
   - Ensure you're using test keys
   - Check card number format
   - Verify Stripe account is active

3. **"Webhook signature verification failed"**
   - Check webhook secret matches
   - Ensure raw request body is used
   - Verify endpoint URL is correct

### Debug Mode
- Enable browser developer tools
- Check console logs for Stripe errors
- Monitor network requests

## 📚 Additional Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Elements Guide](https://stripe.com/docs/stripe-js)

---

**Remember**: Keep your production keys secure and never commit them to version control! 