"use client"

import { useState } from "react"
import { countryOptions } from "@/lib/data/visa-requirements"
import { VisaRequirement } from "@/lib/types/visa"
import { useIntl } from "@/components/IntlProvider"
import enMessages from "@/messages/en.json"

type TabType = 'passport' | 'visa' | 'checklist'

export default function VisaPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [visaData, setVisaData] = useState<VisaRequirement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [activeTab, setActiveTab] = useState<TabType>('visa')

  // SSR fallback pattern with English fallback
  let t: (key: string) => string
  try {
    const intl = useIntl()
    t = intl.t
  } catch {
    t = (key: string) => {
      const keys = key.split('.')
      let value: any = enMessages
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    }
  }

  const handleCountrySelect = async (countryCode: string) => {
    if (!countryCode) {
      setVisaData(null)
      setError("")
      return
    }

    setSelectedCountry(countryCode)
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/visa-lookup?countryCode=${countryCode}`)
      const result = await response.json()

      if (result.success && result.data) {
        setVisaData(result.data)
      } else {
        setError(result.error || t("visa.errorLoadFailed"))
        setVisaData(null)
      }
    } catch (err) {
      setError(t("visa.errorNetwork"))
      setVisaData(null)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'passport' as TabType, label: t("visa.tabPassport") },
    { id: 'visa' as TabType, label: t("visa.tabVisa") },
    { id: 'checklist' as TabType, label: t("visa.tabChecklist") }
  ]

  const renderPassportTab = () => {
    console.log("Rendering passport tab, visaData:", visaData)
    console.log("Passport object:", visaData?.passport)
    if (!visaData?.passport) return null
    const passport = visaData.passport

    return (
      <div className="space-y-8">
        {/* Passport Validity Requirements */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("visa.passportSection")}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">
                {t("visa.passportValidity")}
              </h3>
              <p className="text-sm text-indigo-700 mb-2">{t("visa.minimumValidity")}</p>
              <p className="text-2xl font-bold text-indigo-700">
                {passport.validityMonths} {t("visa.months")}
              </p>
            </div>

            <div className="bg-teal-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-teal-900 mb-3">
                {t("visa.blankPages")}
              </h3>
              <p className="text-2xl font-bold text-teal-700">
                {passport.blankPages} {t("visa.pages")}
              </p>
            </div>
          </div>

          {/* Passport Office */}
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("visa.passportOffice")}
            </h3>
            <p className="text-lg font-medium text-gray-800 mb-2">{passport.passportOffice}</p>
            <a
              href={passport.passportOfficeWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              {passport.passportOfficeWebsite}
            </a>
          </div>

          {/* Renewal Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("visa.renewalInfo")}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-600">{t("visa.renewalTime")}</p>
                <p className="text-lg font-semibold text-gray-900">{passport.processingDays} {t("visa.days")}</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-600">{t("visa.renewalFee")}</p>
                <p className="text-lg font-semibold text-gray-900">{passport.passportFee}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">{t("visa.renewalDocs")}:</p>
              <ul className="space-y-2">
                {(passport.requiredDocuments || []).map((doc, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Consulate in Spain */}
          <div className="mb-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              {t("visa.consulateInSpain")}
            </h3>
            <p className="text-sm text-blue-700 mb-4">{t("visa.consulateInSpainDesc")}</p>
            <div className="space-y-2 text-blue-800">
              <p><strong>{passport.consulateInSpain.city}</strong></p>
              <p>{passport.consulateInSpain.address}</p>
              <p>{t("visa.phone")}: {passport.consulateInSpain.phone}</p>
              <p>{t("visa.email")}: {passport.consulateInSpain.email}</p>
              <a
                href={passport.consulateInSpain.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block"
              >
                {passport.consulateInSpain.website}
              </a>
            </div>
          </div>

          {/* Apostille Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("visa.apostilleInfo")}
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{t("visa.apostilleAuthority")}</p>
                <p className="font-semibold text-gray-900">{passport.apostilleAuthority}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{t("visa.apostilleTime")}</p>
                <p className="font-semibold text-gray-900">{passport.apostilleProcessingDays} {t("visa.days")}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{t("visa.apostilleFee")}</p>
                <p className="font-semibold text-gray-900">{passport.apostilleFee}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">{t("visa.apostilleDocs")}:</p>
              <ul className="space-y-2">
                {(passport.apostilleDocuments || []).map((doc, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-3">
              {t("visa.passportNotes")}
            </h3>
            <ul className="space-y-2">
              {(passport.notes || []).map((note, index) => (
                <li key={index} className="flex items-start text-amber-800">
                  <span className="text-amber-500 mr-2">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const renderVisaTab = () => {
    if (!visaData) return null

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {visaData.countryName} - {t("visa.studentVisaInfo")}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">
                {t("visa.processingTime")}
              </h3>
              <p className="text-2xl font-bold text-purple-700">
                {visaData.processingTimeDays} {t("visa.days")}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                {t("visa.visaFee")}
              </h3>
              <p className="text-2xl font-bold text-blue-700">
                {visaData.visaFee}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t("visa.consulateIn")} {visaData.consulateCity}
            </h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>{t("visa.address")}:</strong> {visaData.consulateAddress}</p>
              <p><strong>{t("visa.phone")}:</strong> {visaData.consulatePhone}</p>
              <p><strong>{t("visa.email")}:</strong> {visaData.consulateEmail}</p>
              <p>
                <strong>{t("visa.website")}:</strong>{" "}
                <a
                  href={visaData.consulateWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {visaData.consulateWebsite}
                </a>
              </p>
              {visaData.appointmentUrl && (
                <p>
                  <a
                    href={visaData.appointmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                  >
                    {t("visa.scheduleAppointment")}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {t("visa.requiredDocuments")}
          </h3>
          <div className="space-y-4">
            {visaData.documents.map((doc, index) => (
              <div
                key={doc.id}
                className="border-l-4 border-purple-500 bg-gray-50 p-6 rounded-r-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {index + 1}. {doc.name}
                    </h4>
                    <p className="text-gray-600 mb-2">
                      {doc.description}
                    </p>
                    {doc.format && (
                      <p className="text-sm text-purple-600 font-medium">
                        {t("visa.format")}: {doc.format}
                      </p>
                    )}
                  </div>
                  {doc.required && (
                    <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      {t("visa.required")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">
            {t("visa.importantNotes")}
          </h3>
          <p className="text-yellow-800">
            {visaData.additionalNotes}
          </p>
        </div>
      </div>
    )
  }

  const renderChecklistTab = () => {
    if (!visaData) return null

    const checklistItems = [
      { id: 'passport', label: visaData.documents.find(d => d.id === 'passport')?.name || 'Valid Passport', checked: false },
      { id: 'application', label: visaData.documents.find(d => d.id === 'application')?.name || 'Visa Application Form', checked: false },
      { id: 'photo', label: visaData.documents.find(d => d.id === 'photo')?.name || 'Recent Photos', checked: false },
      { id: 'admission', label: visaData.documents.find(d => d.id === 'admission')?.name || 'University Admission Letter', checked: false },
      { id: 'financial', label: visaData.documents.find(d => d.id === 'financial')?.name || 'Proof of Financial Means', checked: false },
      { id: 'insurance', label: visaData.documents.find(d => d.id === 'insurance')?.name || 'Health Insurance', checked: false },
      { id: 'criminal', label: visaData.documents.find(d => d.id === 'criminal')?.name || 'Criminal Record Certificate', checked: false },
      { id: 'medical', label: visaData.documents.find(d => d.id === 'medical')?.name || 'Medical Certificate', checked: false },
    ]

    const passportChecklist = visaData.passport ? [
      { id: 'passport-valid', label: `Passport valid for ${visaData.passport.validityMonths}+ months`, checked: false },
      { id: 'passport-pages', label: `${visaData.passport.blankPages}+ blank pages available`, checked: false },
      ...(visaData.passport.apostilleDocuments || []).map((doc, i) => ({
        id: `apostille-${i}`,
        label: `${doc} - Apostilled`,
        checked: false
      }))
    ] : []

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {visaData.countryName} - {t("visa.tabChecklist")}
          </h2>

          <p className="text-gray-600 mb-6">
            Use this checklist to track your document preparation progress.
          </p>

          {/* Passport Requirements Checklist */}
          {visaData.passport && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                {t("visa.passportSection")}
              </h3>
              <div className="space-y-3 ml-11">
                {passportChecklist.map((item) => (
                  <label key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Visa Documents Checklist */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
              {t("visa.requiredDocuments")}
            </h3>
            <div className="space-y-3 ml-11">
              {checklistItems.map((item) => (
                <label key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="ml-3 text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.print()}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t("visa.downloadChecklist")}
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm">
          {t("visa.lastUpdated")}: November 2025
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("visa.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("visa.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <label htmlFor="country-select" className="block text-lg font-medium text-gray-900 mb-4">
            {t("visa.selectCountry")}
          </label>
          <select
            id="country-select"
            value={selectedCountry}
            onChange={(e) => handleCountrySelect(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="">{t("visa.chooseCountry")}</option>
            {countryOptions.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">{t("visa.loading")}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {visaData && !loading && (
          <>
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        py-4 px-1 border-b-2 font-medium text-lg transition-colors
                        ${activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {activeTab === 'passport' && renderPassportTab()}
              {activeTab === 'visa' && renderVisaTab()}
              {activeTab === 'checklist' && renderChecklistTab()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
