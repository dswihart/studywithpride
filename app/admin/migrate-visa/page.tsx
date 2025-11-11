'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MigrateVisaPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    setStatus('Starting migration...');

    try {
      const supabase = createClient();

      // Step 1: Insert Spain requirements
      setStatus('Adding Spain visa requirements...');
      const { error: esError } = await supabase
        .from('visa_requirements')
        .upsert({
          country_code: 'ES',
          country_name: 'Spain',
          requirements: [
            { id: 'passport', label: 'Valid Passport', description: 'Passport must be valid for at least 6 months', required: true, category: 'identification' },
            { id: 'acceptance_letter', label: 'University Acceptance Letter', description: 'Official acceptance from Spanish university', required: true, category: 'academic' },
            { id: 'nie_application', label: 'NIE Application', description: 'Foreigner Identity Number application', required: true, category: 'identification' },
            { id: 'health_insurance', label: 'Health Insurance', description: 'Valid health insurance in Spain', required: true, category: 'health' },
            { id: 'proof_of_funds', label: 'Proof of Funds (IPREM)', description: 'Bank statements (100% IPREM monthly)', required: true, category: 'financial' },
            { id: 'accommodation_proof', label: 'Accommodation Proof', description: 'Rental contract or host letter', required: true, category: 'housing' },
            { id: 'criminal_record', label: 'Criminal Record Certificate', description: 'Apostilled certificate from home country', required: true, category: 'legal' },
            { id: 'medical_certificate', label: 'Medical Certificate', description: 'No public health risk diseases', required: true, category: 'health' },
            { id: 'visa_application_form', label: 'Visa Application Form', description: 'Spanish form EX-00', required: true, category: 'administrative' },
            { id: 'passport_photos', label: 'Passport Photos', description: 'Recent photos meeting requirements', required: true, category: 'administrative' }
          ],
          general_info: 'Student visa for Spain requires acceptance, funds, and health coverage.',
          processing_time: '1-3 months',
          estimated_cost: '€60-180'
        }, { onConflict: 'country_code' });

      if (esError) {
        setStatus(`Spain error: ${esError.message}`);
        setLoading(false);
        return;
      }

      // Step 2: Insert UK requirements
      setStatus('Adding UK visa requirements...');
      const { error: gbError } = await supabase
        .from('visa_requirements')
        .upsert({
          country_code: 'GB',
          country_name: 'United Kingdom',
          requirements: [
            { id: 'passport', label: 'Valid Passport', description: 'Passport with 6 months validity', required: true, category: 'identification' },
            { id: 'cas_number', label: 'CAS Number', description: 'Confirmation of Acceptance for Studies', required: true, category: 'academic' },
            { id: 'tb_test', label: 'TB Test Certificate', description: 'If from listed countries', required: false, category: 'health' },
            { id: 'maintenance_funds', label: 'Maintenance Funds', description: '£1,334/month (London) or £1,023', required: true, category: 'financial' },
            { id: 'ielts_certificate', label: 'English Language Test', description: 'IELTS, TOEFL, or approved test', required: true, category: 'academic' },
            { id: 'accommodation_proof', label: 'Accommodation Details', description: 'Where you will stay', required: false, category: 'housing' }
          ],
          general_info: 'UK Student visa requires CAS, financial proof, and English proficiency.',
          processing_time: '3 weeks',
          estimated_cost: '£363'
        }, { onConflict: 'country_code' });

      if (gbError) {
        setStatus(`UK error: ${gbError.message}`);
        setLoading(false);
        return;
      }

      // Step 3: Insert USA requirements
      setStatus('Adding USA visa requirements...');
      const { error: usError } = await supabase
        .from('visa_requirements')
        .upsert({
          country_code: 'US',
          country_name: 'United States',
          requirements: [
            { id: 'passport', label: 'Valid Passport', description: 'Valid 6 months beyond program end', required: true, category: 'identification' },
            { id: 'i20_form', label: 'Form I-20', description: 'Certificate of Eligibility from university', required: true, category: 'academic' },
            { id: 'sevis_fee', label: 'SEVIS Fee', description: 'I-901 fee ($350) receipt', required: true, category: 'financial' },
            { id: 'ds160_form', label: 'DS-160 Form', description: 'Nonimmigrant visa application', required: true, category: 'administrative' },
            { id: 'financial_documents', label: 'Financial Documents', description: 'Bank statements, sponsor letters', required: true, category: 'financial' },
            { id: 'visa_interview', label: 'Visa Interview', description: 'At US Embassy/Consulate', required: true, category: 'administrative' }
          ],
          general_info: 'F-1 Student visa requires I-20, SEVIS payment, and interview.',
          processing_time: '2-8 weeks',
          estimated_cost: '$510'
        }, { onConflict: 'country_code' });

      if (usError) {
        setStatus(`USA error: ${usError.message}`);
        setLoading(false);
        return;
      }

      setStatus('✅ Migration completed successfully! Added Spain, UK, and USA visa requirements.');
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Visa Requirements Migration</h1>
      <p>This will populate the visa_requirements table with Spain, UK, and USA requirements.</p>

      <button
        onClick={runMigration}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginTop: '20px'
        }}
      >
        {loading ? 'Running Migration...' : 'Run Visa Migration'}
      </button>

      {status && (
        <pre style={{
          background: '#f5f5f5',
          padding: '20px',
          marginTop: '20px',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap'
        }}>
          {status}
        </pre>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#fff3cd', borderRadius: '4px' }}>
        <h3>Note:</h3>
        <p>If you see an error about the table not existing, you need to create it first:</p>
        <ol>
          <li>Go to <a href="https://supabase.com/dashboard/project/eurovhkmzgqtjrkjwrpb/sql-editor" target="_blank">Supabase SQL Editor</a></li>
          <li>Run this SQL:</li>
        </ol>
        <pre style={{ background: '#000', color: '#0f0', padding: '10px', overflow: 'auto' }}>
{`CREATE TABLE IF NOT EXISTS public.visa_requirements (
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

CREATE POLICY IF NOT EXISTS "Authenticated users can view visa requirements"
  ON public.visa_requirements FOR SELECT TO authenticated USING (true);

ALTER TABLE public.application_states
ADD COLUMN IF NOT EXISTS destination_country TEXT;`}
        </pre>
        <p>Then click the button above to populate the data.</p>
      </div>
    </div>
  );
}
