import { VisaRequirement } from '@/lib/types/visa'

export const visaRequirements: Record<string, VisaRequirement> = {
  MX: {
    countryCode: 'MX',
    countryName: 'Mexico',
    countryNameEs: 'México',
    consulateCity: 'Ciudad de México',
    consulateAddress: 'Av. Presidente Masaryk 201, Polanco, Miguel Hidalgo, 11560 Ciudad de México, CDMX',
    consulatePhone: '+52 55 5282 2271',
    consulateEmail: 'emb.mexico@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/mexico',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/186417c2ca26b9c0c14aafa55d7e265e2',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photo',
        nameEs: 'Fotografía reciente',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Processing time is approximately 1 month. Schedule your appointment well in advance. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'El tiempo de tramitación es aproximadamente 1 mes. Programe su cita con suficiente antelación. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  CO: {
    countryCode: 'CO',
    countryName: 'Colombia',
    countryNameEs: 'Colombia',
    consulateCity: 'Bogotá',
    consulateAddress: 'Calle 92 No. 12-68, Bogotá, Colombia',
    consulatePhone: '+57 1 622 0090',
    consulateEmail: 'emb.bogota@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/bogota',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/1c2f3d32cf8f6cd9',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión',
        description: 'Official university admission letter',
        descriptionEs: 'Carta de admisión universitaria',
        required: true
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación económica',
        description: 'Bank statements showing minimum €600/month',
        descriptionEs: 'Acreditación de mínimo €600/mes',
        required: true
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Comprehensive health insurance valid in Spain',
        descriptionEs: 'Seguro médico completo en España',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Antecedentes penales',
        description: 'Apostilled criminal record certificate',
        descriptionEs: 'Certificado de antecedentes penales apostillado',
        required: true
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating good health',
        descriptionEs: 'Certificado de salud',
        required: true
      }
    ],
    additionalNotes: 'Colombia is part of the Hague Apostille Convention. Documents must be apostilled. Processing time is approximately 1 month.',
    additionalNotesEs: 'Colombia es parte del Convenio de la Apostilla de La Haya. Los documentos deben ser apostillados. El tiempo de tramitación es aproximadamente 1 mes.'
  },
  AR: {
    countryCode: 'AR',
    countryName: 'Argentina',
    countryNameEs: 'Argentina',
    consulateCity: 'Buenos Aires',
    consulateAddress: 'Guido 1760, C1119AAT Buenos Aires, Argentina',
    consulatePhone: '+54 11 4811 0070',
    consulateEmail: 'emb.buenosaires@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/buenosaires',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/2b4a6e9df45c',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte vigente (6+ meses de validez)',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Formulario',
        description: 'National visa application',
        descriptionEs: 'Solicitud de visado nacional',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photographs',
        nameEs: 'Fotografías',
        description: '2 passport-size photos',
        descriptionEs: '2 fotos tamaño pasaporte',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta universitaria',
        description: 'Admission confirmation',
        descriptionEs: 'Confirmación de admisión',
        required: true
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Medios económicos',
        description: 'Proof of minimum €600/month',
        descriptionEs: 'Mínimo €600/mes',
        required: true
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro',
        description: 'Health coverage valid in Spain',
        descriptionEs: 'Cobertura médica',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado policial',
        description: 'Criminal record (apostilled)',
        descriptionEs: 'Antecedentes penales (apostillado)',
        required: true
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado de salud',
        description: 'Medical clearance certificate',
        descriptionEs: 'Certificado médico',
        required: true
      }
    ],
    additionalNotes: 'Argentina uses the apostille system. Processing typically takes 4 weeks. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'Argentina utiliza el sistema de apostilla. El procesamiento suele tardar 4 semanas. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brazil',
    countryNameEs: 'Brasil',
    consulateCity: 'Brasília',
    consulateAddress: 'SES Av. das Nações, Qd. 811, Lt. 44, 70429-900 Brasília, DF',
    consulatePhone: '+55 61 3701 1600',
    consulateEmail: 'emb.brasilia@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/brasilia',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/3e5b7f8a9c1d',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Brazil is part of the Hague Apostille Convention. Processing time is approximately 1 month. All documents not in Spanish or Portuguese must be officially translated.',
    additionalNotesEs: 'Brasil es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español o portugués deben ser traducidos oficialmente.'
  },
  CL: {
    countryCode: 'CL',
    countryName: 'Chile',
    countryNameEs: 'Chile',
    consulateCity: 'Santiago',
    consulateAddress: 'Av. Andrés Bello 1895, Providencia, Santiago',
    consulatePhone: '+56 2 2235 2755',
    consulateEmail: 'emb.santiago@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/santiago',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/4c6d8e9f2a3b',
    processingTimeDays: 25,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Chile is part of the Hague Apostille Convention. Processing time is approximately 3-4 weeks. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'Chile es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 3-4 semanas. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  PE: {
    countryCode: 'PE',
    countryName: 'Peru',
    countryNameEs: 'Perú',
    consulateCity: 'Lima',
    consulateAddress: 'Av. Jorge Basadre 498, San Isidro, Lima 27',
    consulatePhone: '+51 1 212 5155',
    consulateEmail: 'emb.lima@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/lima',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/5d7e9f1a2b4c',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Peru is part of the Hague Apostille Convention. Processing time is approximately 1 month. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'Perú es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  EC: {
    countryCode: 'EC',
    countryName: 'Ecuador',
    countryNameEs: 'Ecuador',
    consulateCity: 'Quito',
    consulateAddress: 'Av. 12 de Octubre 1955 y Cordero, Edificio World Trade Center, Torre B, Piso 14, Quito',
    consulatePhone: '+593 2 397 1800',
    consulateEmail: 'emb.quito@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/quito',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/6e8f9a1b2c5d',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Ecuador is part of the Hague Apostille Convention. Processing time is approximately 1 month. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'Ecuador es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  VE: {
    countryCode: 'VE',
    countryName: 'Venezuela',
    countryNameEs: 'Venezuela',
    consulateCity: 'Caracas',
    consulateAddress: 'Av. Mohedano, entre 1era y 2da transversal, Edificio Centro Gerencial Mohedano, Piso 9, La Castellana, Caracas',
    consulatePhone: '+58 212 263 2855',
    consulateEmail: 'emb.caracas@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/caracas',
    processingTimeDays: 35,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled or legalized',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado o legalizado',
        required: true,
        format: 'Apostillado o legalizado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Processing time may take longer due to current situation. Documents can be apostilled or legalized through diplomatic channels. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'El tiempo de tramitación puede ser más largo debido a la situación actual. Los documentos pueden ser apostillados o legalizados por vía diplomática. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  UY: {
    countryCode: 'UY',
    countryName: 'Uruguay',
    countryNameEs: 'Uruguay',
    consulateCity: 'Montevideo',
    consulateAddress: 'Libertad 2738, 11300 Montevideo',
    consulatePhone: '+598 2708 6010',
    consulateEmail: 'emb.montevideo@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/montevideo',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/7f9a1c2d3e6f',
    processingTimeDays: 25,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Uruguay is part of the Hague Apostille Convention. Processing time is approximately 3-4 weeks. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'Uruguay es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 3-4 semanas. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  PY: {
    countryCode: 'PY',
    countryName: 'Paraguay',
    countryNameEs: 'Paraguay',
    consulateCity: 'Asunción',
    consulateAddress: 'Yegros 437 esq. EE.UU., Asunción',
    consulatePhone: '+595 21 490 686',
    consulateEmail: 'emb.asuncion@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/asuncion',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/8a1b2c3d4e7f',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Paraguay is part of the Hague Apostille Convention. Processing time is approximately 1 month. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'Paraguay es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  DO: {
    countryCode: 'DO',
    countryName: 'Dominican Republic',
    countryNameEs: 'República Dominicana',
    consulateCity: 'Santo Domingo',
    consulateAddress: 'Calle Rafael Augusto Sánchez 21, Piantini, Santo Domingo',
    consulatePhone: '+1 809 537 0070',
    consulateEmail: 'emb.santodomingo@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/santodomingo',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/8g0b1d3e4f7h',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Dominican Republic is part of the Hague Apostille Convention. Processing time is approximately 1 month. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'República Dominicana es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
  PA: {
    countryCode: 'PA',
    countryName: 'Panama',
    countryNameEs: 'Panamá',
    consulateCity: 'Panama City',
    consulateAddress: 'Calle 53 Este, Marbella, Edificio Ocean Business Plaza, Piso 11, Panama City',
    consulatePhone: '+507 227 5122',
    consulateEmail: 'emb.panama@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/panama',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/9h1c2e4f5g8i',
    processingTimeDays: 30,
    visaFee: '€80',
    documents: [
      {
        id: 'passport',
        name: 'Valid passport',
        nameEs: 'Pasaporte vigente',
        description: 'Passport valid for at least 6 months beyond intended stay',
        descriptionEs: 'Pasaporte con vigencia mínima de 6 meses posteriores a la estancia prevista',
        required: true,
        format: 'Original + copia'
      },
      {
        id: 'application',
        name: 'Visa application form',
        nameEs: 'Solicitud de visado',
        description: 'Completed and signed national visa application form',
        descriptionEs: 'Formulario de solicitud de visado nacional completado y firmado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos (3.5 x 4.5 cm, white background)',
        descriptionEs: '2 fotografías recientes tamaño pasaporte (3.5 x 4.5 cm, fondo blanco)',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión de universidad española',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month (IPREM) for duration of stay',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes (IPREM) por duración de estancia',
        required: true,
        format: 'Últimos 3 meses'
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage, no co-payments',
        descriptionEs: 'Seguro médico válido en España con cobertura completa, sin copagos',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Certificate of no criminal record from country of residence (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales del país de residencia (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating applicant does not suffer from diseases with serious public health repercussions',
        descriptionEs: 'Certificado médico que acredite que el solicitante no padece enfermedades con repercusiones de salud pública graves',
        required: true
      }
    ],
    additionalNotes: 'Panama is part of the Hague Apostille Convention. Processing time is approximately 1 month. All documents not in Spanish must be officially translated.',
    additionalNotesEs: 'Panamá es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español deben ser traducidos oficialmente.'
  },
}

export const supportedCountries = [
  { code: 'AR', name: 'Argentina', nameEs: 'Argentina' },
  { code: 'BR', name: 'Brazil', nameEs: 'Brasil' },
  { code: 'CL', name: 'Chile', nameEs: 'Chile' },
  { code: 'CO', name: 'Colombia', nameEs: 'Colombia' },
  { code: 'DO', name: 'Dominican Republic', nameEs: 'República Dominicana' },
  { code: 'EC', name: 'Ecuador', nameEs: 'Ecuador' },
  { code: 'MX', name: 'Mexico', nameEs: 'México' },
  { code: 'PA', name: 'Panama', nameEs: 'Panamá' },
  { code: 'PY', name: 'Paraguay', nameEs: 'Paraguay' },
  { code: 'PE', name: 'Peru', nameEs: 'Perú' },
  { code: 'UY', name: 'Uruguay', nameEs: 'Uruguay' },
  { code: 'VE', name: 'Venezuela', nameEs: 'Venezuela' }
]
