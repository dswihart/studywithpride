-- Add country field to application_states
ALTER TABLE public.application_states
ADD COLUMN IF NOT EXISTS destination_country TEXT;

-- Create visa requirements template table
CREATE TABLE IF NOT EXISTS public.visa_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  general_info TEXT,
  processing_time TEXT,
  estimated_cost TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visa_requirements ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read visa requirements
CREATE POLICY IF NOT EXISTS "Authenticated users can view visa requirements"
  ON public.visa_requirements FOR SELECT
  TO authenticated
  USING (true);

-- Insert default visa requirements for Spain
INSERT INTO public.visa_requirements (country_code, country_name, requirements, general_info, processing_time, estimated_cost)
VALUES (
  'ES',
  'Spain',
  '[
    {
      "id": "passport",
      "label": "Valid Passport",
      "description": "Passport must be valid for at least 6 months beyond intended stay",
      "required": true,
      "category": "identification"
    },
    {
      "id": "acceptance_letter",
      "label": "University Acceptance Letter",
      "description": "Official letter of acceptance from Spanish university",
      "required": true,
      "category": "academic"
    },
    {
      "id": "nie_application",
      "label": "NIE (Foreigner Identity Number) Application",
      "description": "Application for Spanish identification number for foreigners",
      "required": true,
      "category": "identification"
    },
    {
      "id": "health_insurance",
      "label": "Health Insurance",
      "description": "Private or public health insurance valid in Spain",
      "required": true,
      "category": "health"
    },
    {
      "id": "proof_of_funds",
      "label": "Proof of Financial Means (IPREM)",
      "description": "Bank statements showing sufficient funds (100% IPREM per month)",
      "required": true,
      "category": "financial"
    },
    {
      "id": "accommodation_proof",
      "label": "Proof of Accommodation",
      "description": "Rental contract or letter from host family",
      "required": true,
      "category": "housing"
    },
    {
      "id": "criminal_record",
      "label": "Criminal Record Certificate",
      "description": "Certificate from your home country, apostilled",
      "required": true,
      "category": "legal"
    },
    {
      "id": "medical_certificate",
      "label": "Medical Certificate",
      "description": "Certificate stating you do not have diseases that pose public health risk",
      "required": true,
      "category": "health"
    },
    {
      "id": "visa_application_form",
      "label": "Completed Visa Application Form",
      "description": "Official Spanish student visa application form (EX-00)",
      "required": true,
      "category": "administrative"
    },
    {
      "id": "passport_photos",
      "label": "Passport-sized Photos",
      "description": "Recent color photos meeting Spanish visa photo requirements",
      "required": true,
      "category": "administrative"
    }
  ]'::jsonb,
  'Student visa for Spain requires proof of acceptance, sufficient funds, and health coverage.',
  '1-3 months',
  '€60-180'
)
ON CONFLICT (country_code) DO UPDATE
SET requirements = EXCLUDED.requirements,
    general_info = EXCLUDED.general_info,
    processing_time = EXCLUDED.processing_time,
    estimated_cost = EXCLUDED.estimated_cost,
    updated_at = NOW();

-- Insert UK visa requirements
INSERT INTO public.visa_requirements (country_code, country_name, requirements, general_info, processing_time, estimated_cost)
VALUES (
  'GB',
  'United Kingdom',
  '[
    {
      "id": "passport",
      "label": "Valid Passport",
      "description": "Passport with at least 6 months validity",
      "required": true,
      "category": "identification"
    },
    {
      "id": "cas_number",
      "label": "CAS (Confirmation of Acceptance for Studies)",
      "description": "CAS number from your UK university",
      "required": true,
      "category": "academic"
    },
    {
      "id": "tb_test",
      "label": "TB Test Certificate",
      "description": "Tuberculosis test from approved clinic (if from listed countries)",
      "required": false,
      "category": "health"
    },
    {
      "id": "maintenance_funds",
      "label": "Proof of Maintenance Funds",
      "description": "£1,334 per month for 9 months (London) or £1,023 (outside London)",
      "required": true,
      "category": "financial"
    },
    {
      "id": "ielts_certificate",
      "label": "English Language Certificate",
      "description": "IELTS, TOEFL, or other approved English test",
      "required": true,
      "category": "academic"
    },
    {
      "id": "accommodation_proof",
      "label": "Accommodation Details",
      "description": "Proof of where you will be staying",
      "required": false,
      "category": "housing"
    }
  ]'::jsonb,
  'UK Student visa (formerly Tier 4) requires CAS, financial proof, and English language proficiency.',
  '3 weeks',
  '£363'
)
ON CONFLICT (country_code) DO UPDATE
SET requirements = EXCLUDED.requirements,
    general_info = EXCLUDED.general_info,
    processing_time = EXCLUDED.processing_time,
    estimated_cost = EXCLUDED.estimated_cost,
    updated_at = NOW();

-- Insert USA visa requirements
INSERT INTO public.visa_requirements (country_code, country_name, requirements, general_info, processing_time, estimated_cost)
VALUES (
  'US',
  'United States',
  '[
    {
      "id": "passport",
      "label": "Valid Passport",
      "description": "Passport valid for at least 6 months beyond program end date",
      "required": true,
      "category": "identification"
    },
    {
      "id": "i20_form",
      "label": "Form I-20",
      "description": "Certificate of Eligibility issued by your US university",
      "required": true,
      "category": "academic"
    },
    {
      "id": "sevis_fee",
      "label": "SEVIS Fee Payment",
      "description": "Pay I-901 SEVIS fee ($350) and keep receipt",
      "required": true,
      "category": "financial"
    },
    {
      "id": "ds160_form",
      "label": "DS-160 Form",
      "description": "Completed nonimmigrant visa application form",
      "required": true,
      "category": "administrative"
    },
    {
      "id": "financial_documents",
      "label": "Financial Documents",
      "description": "Bank statements, sponsor letters proving ability to pay tuition and living costs",
      "required": true,
      "category": "financial"
    },
    {
      "id": "visa_interview",
      "label": "Visa Interview Appointment",
      "description": "Schedule and attend visa interview at US Embassy/Consulate",
      "required": true,
      "category": "administrative"
    }
  ]'::jsonb,
  'F-1 Student visa for USA requires I-20, SEVIS payment, and visa interview.',
  '2-8 weeks',
  '$510'
)
ON CONFLICT (country_code) DO UPDATE
SET requirements = EXCLUDED.requirements,
    general_info = EXCLUDED.general_info,
    processing_time = EXCLUDED.processing_time,
    estimated_cost = EXCLUDED.estimated_cost,
    updated_at = NOW();
