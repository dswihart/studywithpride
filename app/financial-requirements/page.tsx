export const metadata = {
  title: 'Financial Requirements | Study With Pride',
  description: 'Understand the financial requirements for your Spanish student visa.',
}

export default function FinancialRequirementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Financial Requirements</h1>
        <p className="text-lg mb-8">Information about financial requirements for Spanish student visa.</p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">IPREM 2024</h2>
          <p className="mb-4">The minimum financial requirement is based on IPREM (Public Indicator of Multiple Effects Income).</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Monthly IPREM 2024: €600</li>
            <li>Annual IPREM 2024: €7,200</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Calculation</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>For stays up to 1 year: 100% of monthly IPREM × number of months</li>
            <li>For stays over 1 year: 100% annual IPREM first year + 75% monthly IPREM for additional months</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Bank Statements</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Last 3-6 months of bank statements</li>
            <li>Must show sufficient funds above minimum requirement</li>
            <li>Official documents required (stamped/signed)</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Health Insurance</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Comprehensive coverage valid in Spain</li>
            <li>No co-payments or deductibles</li>
            <li>Minimum coverage: €30,000</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
