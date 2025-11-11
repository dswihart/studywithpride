interface TestimonialCardProps {
  name: string
  country: string
  program: string
  quote: string
  photo: string
}

export default function TestimonialCard({ name, country, program, quote, photo }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4">{photo}</div>
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-500">{country} • {program}</p>
        </div>
      </div>
      <p className="text-gray-700 italic leading-relaxed">
        &quot;{quote}&quot;
      </p>
    </div>
  )
}
