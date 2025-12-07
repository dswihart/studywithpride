'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PartnersPage() {
  const [expandedProgram, setExpandedProgram] = useState<string | null>('ba-tourism');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pride Bar */}
      <div className="h-1.5"
           style={{background: 'linear-gradient(90deg, #E40303 0%, #E40303 16.66%, #FF8C00 16.66%, #FF8C00 33.33%, #FFED00 33.33%, #FFED00 50%, #008026 50%, #008026 66.66%, #24408E 66.66%, #24408E 83.33%, #732982 83.33%, #732982 100%)'}} />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl text-gray-900">
            <span className="text-2xl">&#127987;&#65039;&#8205;&#127752;</span>
            Study With Pride
          </Link>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <span>&#128205;</span>
            <span className="font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">Gayxample</span>
            <span>, Barcelona</span>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Partner Schools</h1>
          <p className="text-white/80">Explore our partner institutions and their programmes</p>
        </div>
      </section>

      {/* C3S Business School Section */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* School Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">&#127891;</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">C3S Business School</h2>
                </div>
                <p className="text-gray-600 mb-4 max-w-2xl">
                  Located in Barcelona&apos;s vibrant Gayxample district, C3S Business School offers UK-accredited degrees
                  in partnership with Arden University and OTHM Qualifications.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>&#127963;&#65039;</span> Arden University Partner
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>&#128220;</span> OTHM Qualifications
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>&#127987;&#65039;&#8205;&#127752;</span> LGBTQ+ Friendly
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-800">98%</div>
                    <div className="text-xs text-gray-500">International</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-800">43+</div>
                    <div className="text-xs text-gray-500">Nationalities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Programs List */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Available Programmes</h3>

          <div className="space-y-4">
            {/* BA (Hons) Business Tourism */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => setExpandedProgram(expandedProgram === 'ba-tourism' ? null : 'ba-tourism')}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">&#9992;&#65039;</span>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900">BA (Hons) Business Tourism</h4>
                    <p className="text-sm text-gray-500">3 Years &bull; 180 ECTS &bull; UK Degree</p>
                  </div>
                </div>
                <span className={`text-2xl text-purple-600 transition-transform ${expandedProgram === 'ba-tourism' ? 'rotate-180' : ''}`}>
                  &#8964;
                </span>
              </button>

              {expandedProgram === 'ba-tourism' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {/* Quick Facts */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 py-6">
                    {[
                      { icon: '&#9201;&#65039;', value: '36 Months', label: 'Duration' },
                      { icon: '&#128218;', value: '180 ECTS', label: 'Credits' },
                      { icon: '&#128182;', value: '€7,000/yr', label: 'Tuition' },
                      { icon: '&#128197;&#65039;', value: 'Oct, Feb, May', label: 'Intakes' },
                      { icon: '&#127760;', value: 'English', label: 'Language' },
                      { icon: '&#127979;', value: 'On-Campus', label: 'Format' },
                    ].map((fact, idx) => (
                      <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-xl mb-1" dangerouslySetInnerHTML={{__html: fact.icon}} />
                        <div className="text-sm font-bold text-purple-800">{fact.value}</div>
                        <div className="text-xs text-gray-500">{fact.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Programme Structure */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#128203; Programme Structure
                    </h5>
                    <div className="space-y-3">
                      {[
                        { year: 'Year 1', title: 'Level 4 Diploma in Tourism Management', award: 'OTHM, UK' },
                        { year: 'Year 2', title: 'Level 5 Diploma in Tourism Management', award: 'OTHM, UK' },
                        { year: 'Year 3', title: 'BA (Hons) Business Tourism Top-Up', award: 'Arden University, UK' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                          <span className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-3 py-1 rounded-lg text-sm font-bold">
                            {item.year}
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">Awarded by {item.award}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#128214; Modules
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        {
                          level: 'Year 1',
                          modules: ['Academic Writing & Research', 'Business Environment for Tourism', 'Services Marketing', 'Sustainability in Tourism', 'Events Management', 'Tourism Industry Development']
                        },
                        {
                          level: 'Year 2',
                          modules: ['Digital Marketing for Tourism', 'Operations Management', 'Management Accounting', 'Human Resources', 'Contemporary Issues in Tourism', 'Customer Relationship Management']
                        },
                        {
                          level: 'Year 3',
                          modules: ['Contemporary Management Issues', 'Strategic Management', 'Managing Self and Others', 'International Destination Management', 'Research Methods & Dissertation']
                        }
                      ].map((card, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-xl p-5">
                          <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                            {card.level}
                          </span>
                          <ul className="space-y-2">
                            {card.modules.map((mod, i) => (
                              <li key={i} className="flex items-start gap-2 text-white/85 text-sm">
                                <span className="text-purple-400">&#10003;</span>
                                {mod}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#10024; Programme Benefits
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { icon: '&#127891;', title: 'UK Degree', desc: 'Recognized British degree at affordable price' },
                        { icon: '&#128188;', title: 'Paid Internships', desc: 'Opportunities with multinational companies' },
                        { icon: '&#128483;&#65039;', title: 'Free Spanish Classes', desc: '12 months included' },
                        { icon: '&#128101;', title: 'Small Classes', desc: 'Personalized attention' },
                        { icon: '&#128104;&#8205;&#127979;', title: 'Expert Faculty', desc: 'PhD professors with industry experience' },
                        { icon: '&#127987;&#65039;&#8205;&#127752;', title: 'LGBTQ+ Friendly', desc: 'Study in welcoming Gayxample' },
                      ].map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-2xl" dangerouslySetInnerHTML={{__html: benefit.icon}} />
                          <div>
                            <div className="font-semibold text-gray-900">{benefit.title}</div>
                            <div className="text-sm text-gray-500">{benefit.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admission & Fees */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        &#128221; Admission Requirements
                      </h5>
                      <ul className="space-y-2">
                        {[
                          'High School Diploma or equivalent',
                          'Official academic transcripts',
                          'Valid passport copy',
                          'Statement of Purpose (500+ words)',
                          'IELTS 6.0 or C3S Interview',
                        ].map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs">&#10003;</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        &#128176; Tuition & Fees
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                          <span className="font-medium text-gray-900">Annual Tuition</span>
                          <span className="text-2xl font-bold text-purple-800">€7,000</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                          <span className="font-medium text-gray-900">Registration Fee</span>
                          <span className="text-xl font-bold text-gray-700">€300</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BA (Hons) Business Management */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => setExpandedProgram(expandedProgram === 'ba-business' ? null : 'ba-business')}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">&#128188;</span>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900">BA (Hons) Business Management</h4>
                    <p className="text-sm text-gray-500">3 Years &bull; 180 ECTS &bull; UK Degree</p>
                  </div>
                </div>
                <span className={`text-2xl text-purple-600 transition-transform ${expandedProgram === 'ba-business' ? 'rotate-180' : ''}`}>
                  &#8964;
                </span>
              </button>

              {expandedProgram === 'ba-business' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {/* Quick Facts */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 py-6">
                    {[
                      { icon: '&#9201;&#65039;', value: '36 Months', label: 'Duration' },
                      { icon: '&#128218;', value: '180 ECTS', label: 'Credits' },
                      { icon: '&#128182;', value: '€7,000/yr', label: 'Tuition' },
                      { icon: '&#128197;&#65039;', value: 'Oct, Feb, May', label: 'Intakes' },
                      { icon: '&#127760;', value: 'English', label: 'Language' },
                      { icon: '&#127979;', value: 'On-Campus', label: 'Format' },
                    ].map((fact, idx) => (
                      <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-xl mb-1" dangerouslySetInnerHTML={{__html: fact.icon}} />
                        <div className="text-sm font-bold text-purple-800">{fact.value}</div>
                        <div className="text-xs text-gray-500">{fact.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Programme Structure */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#128203; Programme Structure
                    </h5>
                    <div className="space-y-3">
                      {[
                        { year: 'Year 1', title: 'Level 4 Diploma in Business', award: 'OTHM, UK' },
                        { year: 'Year 2', title: 'Level 5 Diploma in Business', award: 'OTHM, UK' },
                        { year: 'Year 3', title: 'BA (Hons) Business Management Top-Up', award: 'Abertay University, UK' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                          <span className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-3 py-1 rounded-lg text-sm font-bold">
                            {item.year}
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">Awarded by {item.award}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#128214; Modules
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        {
                          level: 'Year 1',
                          modules: ['Academic Writing & Research', 'Business Operations', 'Communication in Business', 'Finance and Accounting', 'Leading and Managing Teams', 'Operating in a Global Context']
                        },
                        {
                          level: 'Year 2',
                          modules: ['Principles & Concepts of Strategy', 'Management of Human Resources', 'Marketing for Managers', 'Business Law for Managers', 'Business Start-up', 'Management Accounting']
                        },
                        {
                          level: 'Year 3',
                          modules: ['Strategic Management', 'Managing Change', 'Operations Management', 'Innovating for Growth', 'International Business']
                        }
                      ].map((card, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-xl p-5">
                          <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                            {card.level}
                          </span>
                          <ul className="space-y-2">
                            {card.modules.map((mod, i) => (
                              <li key={i} className="flex items-start gap-2 text-white/85 text-sm">
                                <span className="text-purple-400">&#10003;</span>
                                {mod}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#10024; Programme Benefits
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { icon: '&#127891;', title: 'UK Degree', desc: 'Recognized British degree at affordable price' },
                        { icon: '&#128188;', title: 'Paid Internships', desc: 'Opportunities with multinational companies' },
                        { icon: '&#128483;&#65039;', title: 'Free Spanish Classes', desc: '12 months included' },
                        { icon: '&#128101;', title: 'Small Classes', desc: 'Personalized attention' },
                        { icon: '&#128104;&#8205;&#127979;', title: 'Expert Faculty', desc: 'PhD professors with industry experience' },
                        { icon: '&#127987;&#65039;&#8205;&#127752;', title: 'LGBTQ+ Friendly', desc: 'Study in welcoming Gayxample' },
                      ].map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-2xl" dangerouslySetInnerHTML={{__html: benefit.icon}} />
                          <div>
                            <div className="font-semibold text-gray-900">{benefit.title}</div>
                            <div className="text-sm text-gray-500">{benefit.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admission & Fees */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        &#128221; Admission Requirements
                      </h5>
                      <ul className="space-y-2">
                        {[
                          'High School Diploma or equivalent',
                          'Official academic transcripts',
                          'Valid passport copy',
                          'Statement of Purpose (500+ words)',
                          'IELTS 6.0 or C3S Interview',
                        ].map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs">&#10003;</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        &#128176; Tuition & Fees
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                          <span className="font-medium text-gray-900">Annual Tuition</span>
                          <span className="text-2xl font-bold text-purple-800">€7,000</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                          <span className="font-medium text-gray-900">Registration Fee</span>
                          <span className="text-xl font-bold text-gray-700">€300</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* MBA with Project Management */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => setExpandedProgram(expandedProgram === 'mba-pm' ? null : 'mba-pm')}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">&#127891;</span>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900">MBA with Project Management</h4>
                    <p className="text-sm text-gray-500">18 Months &bull; 90 ECTS &bull; UK Masters Degree</p>
                  </div>
                </div>
                <span className={`text-2xl text-purple-600 transition-transform ${expandedProgram === 'mba-pm' ? 'rotate-180' : ''}`}>
                  &#8964;
                </span>
              </button>

              {expandedProgram === 'mba-pm' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {/* Quick Facts */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 py-6">
                    {[
                      { icon: '&#9201;&#65039;', value: '18 Months', label: 'Duration' },
                      { icon: '&#128218;', value: '90 ECTS', label: 'Credits' },
                      { icon: '&#128182;', value: '€10,800', label: 'Tuition' },
                      { icon: '&#128197;&#65039;', value: 'October', label: 'Intakes' },
                      { icon: '&#127760;', value: 'English', label: 'Language' },
                      { icon: '&#127979;', value: 'Campus/Online', label: 'Format' },
                    ].map((fact, idx) => (
                      <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-xl mb-1" dangerouslySetInnerHTML={{__html: fact.icon}} />
                        <div className="text-sm font-bold text-purple-800">{fact.value}</div>
                        <div className="text-xs text-gray-500">{fact.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Programme Structure */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#128203; Programme Structure
                    </h5>
                    <div className="space-y-3">
                      {[
                        { year: 'Year 1', title: 'OTHM Level 7 Diploma in Project Management', award: 'OTHM Qualifications, UK', duration: '12 Months' },
                        { year: 'Top-up', title: 'MBA with Project Management', award: 'Abertay University, UK', duration: '6 Months' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                          <span className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-3 py-1 rounded-lg text-sm font-bold">
                            {item.year}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">Awarded by {item.award}</div>
                          </div>
                          <span className="text-sm text-purple-600 font-medium">{item.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#128214; Modules
                    </h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          level: 'OTHM Level 7 (Year 1)',
                          modules: ['Planning, Controlling and Leading a Project', 'Procurement, Risk and Quality in PM', 'Advanced Project Management', 'Project Management in a Global Environment', 'Sustainability in Project Management', 'Contemporary Issues in PM']
                        },
                        {
                          level: 'MBA Top-up Options',
                          modules: ['Planning, Controlling and Leading a Project (15 credits)', 'Procurement Risk and Contract Management (15 credits)', 'Advanced Project and Logistics Management (10 credits)', 'Operations and Information Management (10 credits)', 'Advanced Research Methods (10 credits)']
                        }
                      ].map((card, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-xl p-5">
                          <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                            {card.level}
                          </span>
                          <ul className="space-y-2">
                            {card.modules.map((mod, i) => (
                              <li key={i} className="flex items-start gap-2 text-white/85 text-sm">
                                <span className="text-purple-400">&#10003;</span>
                                {mod}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#10024; Programme Benefits
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { icon: '&#127891;', title: 'UK Masters Degree', desc: 'Awarded by Abertay University' },
                        { icon: '&#128188;', title: 'Career Advancement', desc: '70% employment post-graduation' },
                        { icon: '&#128483;&#65039;', title: 'Free Spanish Classes', desc: '12 months included' },
                        { icon: '&#128187;', title: 'Flexible Learning', desc: 'On-campus or 100% online' },
                        { icon: '&#128104;&#8205;&#127979;', title: 'Expert Faculty', desc: 'PhD professors with industry expertise' },
                        { icon: '&#127987;&#65039;&#8205;&#127752;', title: 'LGBTQ+ Friendly', desc: 'Study in welcoming Gayxample' },
                      ].map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-2xl" dangerouslySetInnerHTML={{__html: benefit.icon}} />
                          <div>
                            <div className="font-semibold text-gray-900">{benefit.title}</div>
                            <div className="text-sm text-gray-500">{benefit.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admission & Fees */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        &#128221; Admission Requirements
                      </h5>
                      <ul className="space-y-2">
                        {[
                          'Bachelor Degree or Equivalent',
                          'Official academic transcripts',
                          'Valid passport copy',
                          'Statement of Purpose (min. 250 words)',
                          'Resume/CV',
                          'IELTS 6.5 or C3S Credibility Interview',
                        ].map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs">&#10003;</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        &#128176; Tuition & Fees
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                          <div>
                            <span className="font-medium text-gray-900">On-Campus</span>
                            <p className="text-xs text-gray-500">Barcelona</p>
                          </div>
                          <span className="text-2xl font-bold text-purple-800">€10,800</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                          <div>
                            <span className="font-medium text-gray-900">Online</span>
                            <p className="text-xs text-gray-500">100% Remote</p>
                          </div>
                          <span className="text-2xl font-bold text-blue-800">€10,300</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                          <span className="font-medium text-gray-900">Registration Fee</span>
                          <span className="text-xl font-bold text-gray-700">€300</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BSc (Hons) Business Computing and Information Systems */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => setExpandedProgram(expandedProgram === 'bsc-computing' ? null : 'bsc-computing')}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">&#128187;</span>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900">BSc (Hons) Business Computing and Information Systems</h4>
                    <p className="text-sm text-gray-500">3 Years &bull; 180 ECTS &bull; UK Degree</p>
                  </div>
                </div>
                <span className={`text-2xl text-purple-600 transition-transform ${expandedProgram === 'bsc-computing' ? 'rotate-180' : ''}`}>
                  &#8964;
                </span>
              </button>

              {expandedProgram === 'bsc-computing' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {/* Quick Facts */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 py-6">
                    {[
                      { icon: '&#9201;&#65039;', value: '36 Months', label: 'Duration' },
                      { icon: '&#128218;', value: '180 ECTS', label: 'Credits' },
                      { icon: '&#128182;', value: '€7,000/yr', label: 'Tuition' },
                      { icon: '&#128197;&#65039;', value: 'Oct, Feb, May', label: 'Intakes' },
                      { icon: '&#127760;', value: 'English', label: 'Language' },
                      { icon: '&#127979;', value: 'On-Campus', label: 'Format' },
                    ].map((fact, idx) => (
                      <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-xl mb-1" dangerouslySetInnerHTML={{__html: fact.icon}} />
                        <div className="text-sm font-bold text-purple-800">{fact.value}</div>
                        <div className="text-xs text-gray-500">{fact.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Programme Structure */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#128203; Programme Structure
                    </h5>
                    <div className="space-y-3">
                      {[
                        { year: 'Year 1', title: 'Level 4 Diploma in Information Technology', award: 'OTHM, UK' },
                        { year: 'Year 2', title: 'Level 5 Diploma in Information Technology', award: 'OTHM, UK' },
                        { year: 'Year 3', title: 'BSc (Hons) Business Computing & Information Systems Top-Up', award: 'University of Central Lancashire (UCLan), UK' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                          <span className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-3 py-1 rounded-lg text-sm font-bold">
                            {item.year}
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">Awarded by {item.award}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#128214; Modules
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        {
                          level: 'Year 1 (Level 4)',
                          modules: ['Cyber Security', 'Principles of Computer Programming', 'Systems Analysis and Design', 'Web and Mobile Applications', 'Computer and Network Technology', 'Managing Digital Information']
                        },
                        {
                          level: 'Year 2 (Level 5)',
                          modules: ['Software Engineering', 'Database Systems', 'Advanced Systems Analysis and Design', 'Management Information Systems', 'IT Project Management', 'Network Information Systems']
                        },
                        {
                          level: 'Year 3 (Top-up)',
                          modules: ['Advanced Database Management Systems', 'Corporate Communication Systems Management', 'eBusiness', 'Managing Information Systems Projects', 'Information Systems Project']
                        }
                      ].map((card, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-xl p-5">
                          <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                            {card.level}
                          </span>
                          <ul className="space-y-2">
                            {card.modules.map((mod, i) => (
                              <li key={i} className="flex items-start gap-2 text-white/85 text-sm">
                                <span className="text-purple-400">&#10003;</span>
                                {mod}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-8">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      &#10024; Programme Benefits
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { icon: '&#127891;', title: 'UK Degree', desc: 'Awarded by University of Central Lancashire' },
                        { icon: '&#128188;', title: 'Paid Internships', desc: 'Opportunities with multinational companies' },
                        { icon: '&#128483;&#65039;', title: 'Free Spanish Classes', desc: '12 months included' },
                        { icon: '&#128101;', title: 'Small Classes', desc: 'Personalized attention' },
                        { icon: '&#128104;&#8205;&#127979;', title: 'Expert Faculty', desc: 'PhD professors with industry experience' },
                        { icon: '&#127987;&#65039;&#8205;&#127752;', title: 'LGBTQ+ Friendly', desc: 'Study in welcoming Gayxample' },
                      ].map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-2xl" dangerouslySetInnerHTML={{__html: benefit.icon}} />
                          <div>
                            <div className="font-semibold text-gray-900">{benefit.title}</div>
                            <div className="text-sm text-gray-500">{benefit.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admission & Fees */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        &#128221; Admission Requirements
                      </h5>
                      <ul className="space-y-2">
                        {[
                          'High School or A-Level or Equivalent',
                          'Mathematics is mandatory in last education',
                          'Official academic transcripts',
                          'Valid passport copy',
                          'Statement of Purpose (min. 250 words)',
                          'A laptop is mandatory',
                          'IELTS 6.0 (5.5 each) or C3S Credibility Interview',
                        ].map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs">&#10003;</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        &#128176; Tuition & Fees
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                          <span className="font-medium text-gray-900">Annual Tuition</span>
                          <span className="text-2xl font-bold text-purple-800">€7,000</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                          <span className="font-medium text-gray-900">Registration Fee</span>
                          <span className="text-xl font-bold text-gray-700">€300</span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-xs text-blue-700">Total programme cost: €21,300 (3 years)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6 text-center">
        <div className="flex items-center justify-center gap-3 text-2xl font-bold text-white mb-6">
          <span>&#127987;&#65039;&#8205;&#127752;</span>
          Study With Pride
        </div>
        <div className="flex justify-center gap-8 flex-wrap mb-8 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <span>&#128205;</span>
            <span>Gayxample, Barcelona, Spain</span>
          </div>
          <div className="flex items-center gap-2">
            <span>&#127760;</span>
            <span>studywithpride.com</span>
          </div>
        </div>
        <div className="flex justify-center gap-8 flex-wrap pt-8 border-t border-white/10 text-white/50 text-xs">
          <span>OTHM Qualifications</span>
          <span>Arden University</span>
          <span>ACBSP Member</span>
          <span>European Council for Business Education</span>
        </div>
        <div className="mt-8 text-white/40 text-xs">
          Independent recruitment agency for C3S Barcelona. Not affiliated with the institution.
        </div>
      </footer>
    </div>
  );
}
