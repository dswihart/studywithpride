# WhatsApp API Provisioning Guide (Story 5.1-C)

> These steps document the manual infrastructure work required before deploying the `/api/recruiter/send-whatsapp` serverless function.

## 1. Create a WhatsApp Business Account
1. Sign in to [Meta Business Suite](https://business.facebook.com/).
2. Create (or select) the Business account that owns Study With Pride’s messaging assets.
3. Navigate to **Business Settings → Accounts → WhatsApp Accounts** and create a new WhatsApp Business Account (WABA) named `StudyWithPride`.
4. Add the production phone number. Complete the verification SMS/voice call flow.

## 2. Generate API Credentials
1. From the WABA dashboard, open **Settings → WhatsApp Manager → API Setup**.
2. Create a **permanent access token** with `whatsapp_business_messaging` and `business_management` scopes.
3. Store the token securely:
   - In CI/CD: `WHATSAPP_API_TOKEN`
   - Never commit the token to Git
4. Copy the base URL for the Meta Cloud API (usually `https://graph.facebook.com/v18.0`).
   - Store as `WHATSAPP_API_URL` in the production secret store.

## 3. Template Approval
1. Under **Template Manager**, create the message templates referenced in Story 5.1-C:
   - `WelcomeMessage`
   - `FollowUp`
2. Include the variables used by `messaging-service.ts` (`{{name}}`, `{{email}}`).
3. Submit each template for Meta approval. Wait for the status to change to **Approved** before deploying.

## 4. Configure Environment Variables
Add the following secrets to the deployment target (e.g., `/var/www/studywithpride/frontend/.env.production.local` or CI variables):
```
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=<permanent-token>
```
Rebuild the application after secrets are in place.

## 5. Permissions & Monitoring
1. Restrict access to the token (CI secret or server file should be `600`).
2. Set up logging/monitoring for WhatsApp API responses.
3. Document any template or phone-number changes here for future audits.

Once these steps are complete, the `/api/recruiter/send-whatsapp` endpoint can send templated WhatsApp messages on behalf of recruiters.
