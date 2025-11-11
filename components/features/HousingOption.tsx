interface HousingOptionProps {
  type: string
  priceRange: string
  description: string
  features: string[]
  lgbtqFriendly?: boolean
}

export default function HousingOption({ 
  type, 
  priceRange, 
  description, 
  features,
  lgbtqFriendly = false
}: HousingOptionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-gray-800">{type}</h3>
        {lgbtqFriendly && (
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
            🏳️‍🌈 LGBTQ+ Friendly
          </span>
        )}
      </div>
      
      <div className="mb-4">
        <span className="text-3xl font-bold text-purple-600">{priceRange}</span>
        <span className="text-gray-500 ml-2">/month</span>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{description}</p>

      <div className="space-y-2">
        <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Features:</h4>
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
