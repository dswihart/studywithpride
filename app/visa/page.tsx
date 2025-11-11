"use client"

import { useState } from "react"
import { supportedCountries } from "@/lib/data/visa-requirements"
import { VisaRequirement } from "@/lib/types/visa"
import { useIntl } from "@/components/IntlProvider"
import enMessages from "@/messages/en.json"

export default function VisaPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [visaData, setVisaData] = useState<VisaRequirement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

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
            {supportedCountries.map((country) => (
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
        )}
      </div>
    </div>
  )
}
