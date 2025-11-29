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
    additionalNotesEs: 'El tiempo de tramitación es aproximadamente 1 mes. Programe su cita con suficiente antelación. Todos los documentos que no estén en español deben ser traducidos oficialmente.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Secretaría de Relaciones Exteriores (SRE)',
      passportOfficeWebsite: 'https://www.gob.mx/sre/acciones-y-programas/pasaportes-702',
      renewalProcessingDays: '3-10',
      renewalFee: 'MXN $1,820 (3 years) / MXN $2,430 (6 years) / MXN $3,640 (10 years)',
      renewalDocuments: [
        'Expired passport or valid ID (INE/IFE)',
        'Birth certificate (original or certified copy)',
        'CURP (Clave Única de Registro de Población)',
        'Proof of payment',
        'Appointment confirmation'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Carrera de San Jerónimo 46, 28014 Madrid',
        phone: '+34 91 369 2814',
        email: 'consmexmadrid@sre.gob.mx',
        website: 'https://embamex.sre.gob.mx/espana/'
      },
      apostilleAuthority: 'Secretaría de Relaciones Exteriores (SRE)',
      apostilleProcessingDays: '3-5',
      apostilleFee: 'MXN $840',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate',
        'Academic transcripts',
        'Medical certificate'
      ],
      notes: [
        'Passport renewal can be done online with appointment at SRE offices',
        'Express service available for additional fee',
        'Minors require both parents present or authorization',
        'Mexican passport valid for 10 years for adults'
      ],
      notesEs: [
        'La renovación del pasaporte se puede hacer en línea con cita en oficinas de la SRE',
        'Servicio exprés disponible por cargo adicional',
        'Menores requieren ambos padres presentes o autorización',
        'Pasaporte mexicano válido por 10 años para adultos'
      ]
    }
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
    additionalNotesEs: 'Colombia es parte del Convenio de la Apostilla de La Haya. Los documentos deben ser apostillados. El tiempo de tramitación es aproximadamente 1 mes.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Ministerio de Relaciones Exteriores / Cancillería',
      passportOfficeWebsite: 'https://www.cancilleria.gov.co/tramites_servicios/pasaportes',
      renewalProcessingDays: '1-8',
      renewalFee: 'COP $231,000 (Regular) / COP $325,000 (Executive)',
      renewalDocuments: [
        'Valid Colombian ID (Cédula de Ciudadanía)',
        'Previous passport (if available)',
        'Digital photo meeting specifications',
        'Proof of payment',
        'Online appointment confirmation'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Calle General Martínez Campos 48, 28010 Madrid',
        phone: '+34 91 700 4970',
        email: 'cmadrid@cancilleria.gov.co',
        website: 'https://espana.embajada.gov.co/'
      },
      apostilleAuthority: 'Ministerio de Relaciones Exteriores',
      apostilleProcessingDays: '1-3',
      apostilleFee: 'COP $63,000',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate (Policía Nacional)',
        'Academic diplomas and transcripts',
        'Medical certificate'
      ],
      notes: [
        'Colombian passport valid for 10 years for adults',
        'Online application via cancilleria.gov.co',
        'Biometric data captured at passport office',
        'Express service available in some offices'
      ],
      notesEs: [
        'Pasaporte colombiano válido por 10 años para adultos',
        'Solicitud en línea via cancilleria.gov.co',
        'Datos biométricos capturados en la oficina de pasaportes',
        'Servicio exprés disponible en algunas oficinas'
      ]
    }
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
    additionalNotesEs: 'Argentina utiliza el sistema de apostilla. El procesamiento suele tardar 4 semanas. Todos los documentos que no estén en español deben ser traducidos oficialmente.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Registro Nacional de las Personas (RENAPER)',
      passportOfficeWebsite: 'https://www.argentina.gob.ar/interior/renaper/pasaporte',
      renewalProcessingDays: '7-15',
      renewalFee: 'ARS $45,000 (Regular) / ARS $90,000 (Express)',
      renewalDocuments: [
        'DNI (Documento Nacional de Identidad)',
        'Previous passport (if available)',
        'Proof of payment',
        'Online appointment via Mi Argentina app'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Calle Fernando el Santo 15, 28010 Madrid',
        phone: '+34 91 771 0500',
        email: 'cmadrid@cancilleria.gob.ar',
        website: 'https://cmadrid.cancilleria.gob.ar/'
      },
      apostilleAuthority: 'Colegio de Escribanos / Ministerio de Relaciones Exteriores',
      apostilleProcessingDays: '1-5',
      apostilleFee: 'ARS $15,000',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate (Registro Nacional de Reincidencia)',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Argentine passport valid for 10 years for adults',
        'Appointments via Mi Argentina app',
        'Express processing available for additional fee',
        'Documents must be legalized before apostille'
      ],
      notesEs: [
        'Pasaporte argentino válido por 10 años para adultos',
        'Turnos via app Mi Argentina',
        'Procesamiento exprés disponible por cargo adicional',
        'Los documentos deben ser legalizados antes de la apostilla'
      ]
    }
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
    additionalNotesEs: 'Brasil es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español o portugués deben ser traducidos oficialmente.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Polícia Federal',
      passportOfficeWebsite: 'https://www.gov.br/pf/pt-br/assuntos/passaporte',
      renewalProcessingDays: '6-15',
      renewalFee: 'BRL R$257.25',
      renewalDocuments: [
        'CPF (Cadastro de Pessoas Físicas)',
        'RG or CNH (identity document)',
        'Previous passport (if available)',
        'Proof of payment (GRU)',
        'Online appointment via Polícia Federal website'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Calle Fernando el Santo 6, 28010 Madrid',
        phone: '+34 91 700 4650',
        email: 'consular.madri@itamaraty.gov.br',
        website: 'https://www.gov.br/mre/pt-br/consulado-madrid'
      },
      apostilleAuthority: 'Cartórios Autorizados pelo CNJ',
      apostilleProcessingDays: '1-3',
      apostilleFee: 'BRL R$127',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate (Certidão de Antecedentes Criminais)',
        'Academic diplomas and transcripts',
        'Medical certificate'
      ],
      notes: [
        'Brazilian passport valid for 10 years for adults',
        'Apply via gov.br portal with CPF',
        'Biometric data captured at Polícia Federal',
        'Emergency passport available for urgent travel'
      ],
      notesEs: [
        'Pasaporte brasileño válido por 10 años para adultos',
        'Solicitar via portal gov.br con CPF',
        'Datos biométricos capturados en la Policía Federal',
        'Pasaporte de emergencia disponible para viajes urgentes'
      ]
    }
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
    additionalNotesEs: 'Chile es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 3-4 semanas. Todos los documentos que no estén en español deben ser traducidos oficialmente.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Registro Civil e Identificación',
      passportOfficeWebsite: 'https://www.registrocivil.cl/principal/canal-tramites/pasaporte',
      renewalProcessingDays: '5-10',
      renewalFee: 'CLP $68,060 (32 pages) / CLP $102,100 (64 pages)',
      renewalDocuments: [
        'Chilean ID card (Cédula de Identidad)',
        'Previous passport (if available)',
        'Proof of payment',
        'Online appointment via Registro Civil website'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Lagasca 88, 28001 Madrid',
        phone: '+34 91 431 9160',
        email: 'cgmadrid@minrel.gob.cl',
        website: 'https://chile.gob.cl/espana/'
      },
      apostilleAuthority: 'Ministerio de Relaciones Exteriores',
      apostilleProcessingDays: '1-3',
      apostilleFee: 'CLP $2,000',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Chilean passport valid for 10 years for adults',
        'Online appointments via registrocivil.cl',
        'Express service available',
        'Passport can be renewed up to 6 months before expiration'
      ],
      notesEs: [
        'Pasaporte chileno válido por 10 años para adultos',
        'Citas en línea via registrocivil.cl',
        'Servicio exprés disponible',
        'El pasaporte se puede renovar hasta 6 meses antes de su vencimiento'
      ]
    }
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
    additionalNotesEs: 'Perú es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español deben ser traducidos oficialmente.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Superintendencia Nacional de Migraciones',
      passportOfficeWebsite: 'https://www.migraciones.gob.pe/pasaporte/',
      renewalProcessingDays: '1-7',
      renewalFee: 'PEN S/98.50',
      renewalDocuments: [
        'DNI (Documento Nacional de Identidad) valid',
        'Previous passport (if available)',
        'Proof of payment at Banco de la Nación',
        'Online appointment via Migraciones website'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Calle Príncipe de Vergara 36, 28001 Madrid',
        phone: '+34 91 431 4242',
        email: 'consulado@embaperu.es',
        website: 'https://www.consulado.pe/es/Madrid/'
      },
      apostilleAuthority: 'Ministerio de Relaciones Exteriores',
      apostilleProcessingDays: '2-5',
      apostilleFee: 'PEN S/31.00',
      apostilleDocuments: [
        'Birth certificate (RENIEC)',
        'Criminal record certificate (Policía Nacional)',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Peruvian passport valid for 5 years',
        'Same-day service available at main office',
        'Appointments via migraciones.gob.pe',
        'Biometric passport with chip'
      ],
      notesEs: [
        'Pasaporte peruano válido por 5 años',
        'Servicio el mismo día disponible en oficina principal',
        'Citas via migraciones.gob.pe',
        'Pasaporte biométrico con chip'
      ]
    }
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
    additionalNotesEs: 'Ecuador es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes. Todos los documentos que no estén en español deben ser traducidos oficialmente.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Registro Civil',
      passportOfficeWebsite: 'https://www.registrocivil.gob.ec/',
      renewalProcessingDays: '3-8',
      renewalFee: 'USD $70 (Regular) / USD $140 (Express)',
      renewalDocuments: [
        'Cédula de Identidad valid',
        'Previous passport (if available)',
        'Proof of payment',
        'Online appointment via Registro Civil'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Calle Velázquez 114, 28006 Madrid',
        phone: '+34 91 562 7215',
        email: 'consuladomadrid@mmrree.gob.ec',
        website: 'https://www.cancilleria.gob.ec/'
      },
      apostilleAuthority: 'Ministerio de Relaciones Exteriores y Movilidad Humana',
      apostilleProcessingDays: '1-3',
      apostilleFee: 'USD $10',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Ecuadorian passport valid for 6 years',
        'Express service (24-48 hours) available',
        'Biometric passport with chip',
        'Can renew up to 1 year before expiration'
      ],
      notesEs: [
        'Pasaporte ecuatoriano válido por 6 años',
        'Servicio exprés (24-48 horas) disponible',
        'Pasaporte biométrico con chip',
        'Se puede renovar hasta 1 año antes del vencimiento'
      ]
    }
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
    additionalNotesEs: 'El tiempo de tramitación puede ser más largo debido a la situación actual. Los documentos pueden ser apostillados o legalizados por vía diplomática. Todos los documentos que no estén en español deben ser traducidos oficialmente.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'SAIME (Servicio Administrativo de Identificación, Migración y Extranjería)',
      passportOfficeWebsite: 'https://www.saime.gob.ve/',
      renewalProcessingDays: '30-180',
      renewalFee: 'USD $200 (varies by location)',
      renewalDocuments: [
        'Cédula de Identidad valid',
        'Previous passport (if available)',
        'Constancia de residencia',
        'Proof of payment',
        'Online appointment via SAIME'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Calle Capitán Haya 1, Edificio Eurocentro, 28020 Madrid',
        phone: '+34 91 598 1200',
        email: 'consuladomadrid@embvenezuela.es',
        website: 'https://espana.embajada.gob.ve/'
      },
      apostilleAuthority: 'Ministerio del Poder Popular para Relaciones Exteriores',
      apostilleProcessingDays: '15-60',
      apostilleFee: 'Variable',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Venezuelan passport valid for 5 years (10 years for minors)',
        'Significant delays due to current situation',
        'Extended passport validity available',
        'Consular passport renewal possible abroad'
      ],
      notesEs: [
        'Pasaporte venezolano válido por 5 años (10 años para menores)',
        'Demoras significativas debido a la situación actual',
        'Prórroga de pasaporte disponible',
        'Renovación consular posible en el extranjero'
      ]
    }
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
        descriptionEs: '2 fotografías recientes tamaño pasaporte',
        required: true
      },
      {
        id: 'admission',
        name: 'University admission letter',
        nameEs: 'Carta de admisión universitaria',
        description: 'Official admission letter from Spanish university',
        descriptionEs: 'Carta oficial de admisión',
        required: true,
        format: 'Original'
      },
      {
        id: 'financial',
        name: 'Proof of financial means',
        nameEs: 'Acreditación de medios económicos',
        description: 'Bank statements showing minimum €600/month',
        descriptionEs: 'Extractos bancarios que demuestren mínimo €600/mes',
        required: true
      },
      {
        id: 'insurance',
        name: 'Health insurance',
        nameEs: 'Seguro médico',
        description: 'Health insurance valid in Spain with comprehensive coverage',
        descriptionEs: 'Seguro médico válido en España',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Certificado de antecedentes penales',
        description: 'Criminal record certificate (last 5 years), apostilled',
        descriptionEs: 'Certificado de antecedentes penales (últimos 5 años), apostillado',
        required: true,
        format: 'Apostillado'
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate stating good health',
        descriptionEs: 'Certificado médico',
        required: true
      }
    ],
    additionalNotes: 'Uruguay is part of the Hague Apostille Convention. Processing time is approximately 3-4 weeks.',
    additionalNotesEs: 'Uruguay es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 3-4 semanas.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Dirección Nacional de Identificación Civil',
      passportOfficeWebsite: 'https://www.gub.uy/tramites/pasaporte-comun',
      renewalProcessingDays: '28-42',
      renewalFee: 'USD $36',
      renewalDocuments: [
        'Cédula de Identidad valid',
        'Previous passport (expired or about to expire)',
        'Birth certificate (issued within last 30 days)',
        'Police clearance certificate (apostilled)',
        'Proof of payment'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Calle Paseo del Prado 26, 28014 Madrid',
        phone: '+34 91 758 3460',
        email: 'cgmadrid@mrree.gub.uy',
        website: 'https://www.gub.uy/ministerio-relaciones-exteriores/'
      },
      apostilleAuthority: 'Ministerio de Relaciones Exteriores',
      apostilleProcessingDays: '1-3',
      apostilleFee: 'USD $15',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Uruguayan passport valid for 10 years for adults',
        'Can renew up to 1 year before expiration',
        'FBI background check required if residing in US (apostilled)',
        'Biometric fingerprint and photo taken at consulate'
      ],
      notesEs: [
        'Pasaporte uruguayo válido por 10 años para adultos',
        'Se puede renovar hasta 1 año antes del vencimiento',
        'Certificado del FBI requerido si reside en EEUU (apostillado)',
        'Huella biométrica y foto tomadas en el consulado'
      ]
    }
  },
  DO: {
    countryCode: 'DO',
    countryName: 'Dominican Republic',
    countryNameEs: 'República Dominicana',
    consulateCity: 'Santo Domingo',
    consulateAddress: 'Av. Independencia 1205, Santo Domingo',
    consulatePhone: '+1 809 535 6500',
    consulateEmail: 'emb.santodomingo@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/santodomingo',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/8a1b2c3d4e5f',
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
        descriptionEs: 'Formulario de solicitud completado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos',
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
        description: 'Health insurance valid in Spain',
        descriptionEs: 'Seguro médico válido en España',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Antecedentes penales',
        description: 'Criminal record certificate, apostilled',
        descriptionEs: 'Certificado de antecedentes penales apostillado',
        required: true
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate',
        descriptionEs: 'Certificado médico',
        required: true
      }
    ],
    additionalNotes: 'Dominican Republic is part of the Hague Apostille Convention. Processing time is approximately 1 month.',
    additionalNotesEs: 'República Dominicana es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Dirección General de Pasaportes',
      passportOfficeWebsite: 'https://www.pasaportes.gob.do/',
      renewalProcessingDays: '7-15',
      renewalFee: 'USD $133 (Standard) / USD $158 (VIP 6 years)',
      renewalDocuments: [
        'Cédula de Identidad valid',
        'Previous passport (expired)',
        'Proof of payment',
        'Recent photograph meeting specifications'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Paseo de la Castellana 30, 28046 Madrid',
        phone: '+34 91 431 5395',
        email: 'consulado@embadom.es',
        website: 'https://www.embajadadominicana.es/'
      },
      apostilleAuthority: 'Procuraduría General de la República',
      apostilleProcessingDays: '3-7',
      apostilleFee: 'DOP $1,000',
      apostilleDocuments: [
        'Birth certificate (Acta de nacimiento)',
        'Criminal record certificate',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Dominican passport valid for 6 years',
        'Biometric passport with security features',
        'VFS Global offices available in USA for renewals',
        'Passport must be requested in person'
      ],
      notesEs: [
        'Pasaporte dominicano válido por 6 años',
        'Pasaporte biométrico con características de seguridad',
        'Oficinas VFS Global disponibles en EEUU para renovaciones',
        'El pasaporte debe solicitarse en persona'
      ]
    }
  },
  PA: {
    countryCode: 'PA',
    countryName: 'Panama',
    countryNameEs: 'Panamá',
    consulateCity: 'Panama City',
    consulateAddress: 'Plaza de Belisario Porras, Edificio Avesa, Piso 4, Panamá',
    consulatePhone: '+507 227 5122',
    consulateEmail: 'emb.panama@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/panama',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/9b2c3d4e5f6a',
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
        descriptionEs: 'Formulario de solicitud completado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos',
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
        description: 'Health insurance valid in Spain',
        descriptionEs: 'Seguro médico válido en España',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Antecedentes penales',
        description: 'Criminal record certificate, apostilled',
        descriptionEs: 'Certificado de antecedentes penales apostillado',
        required: true
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate',
        descriptionEs: 'Certificado médico',
        required: true
      }
    ],
    additionalNotes: 'Panama is part of the Hague Apostille Convention. Processing time is approximately 1 month.',
    additionalNotesEs: 'Panamá es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Dirección Nacional de Pasaportes (Tribunal Electoral)',
      passportOfficeWebsite: 'https://www.tribunal-electoral.gob.pa/',
      renewalProcessingDays: '20-30',
      renewalFee: 'USD $100 (Regular) / USD $50 (Retirees over 55/60)',
      renewalDocuments: [
        'Cédula de Identidad Panameña valid',
        'Previous passport (expired or about to expire)',
        'Three photographs meeting specifications',
        'Passport application form',
        'Fingerprint and signature forms'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Claudio Coello 86, 28006 Madrid',
        phone: '+34 91 576 6866',
        email: 'info@embassyofpanama.org',
        website: 'https://www.embassyofpanama.org/'
      },
      apostilleAuthority: 'Ministerio de Relaciones Exteriores',
      apostilleProcessingDays: '3-5',
      apostilleFee: 'USD $10',
      apostilleDocuments: [
        'Birth certificate (Registro Civil)',
        'Criminal record certificate (Policía Nacional)',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Panamanian passport valid for 5 years',
        'Must appear in person at consulate',
        'Reduced fee for retirees (women 55+, men 60+)',
        'Processing from consulates takes 20-30 days'
      ],
      notesEs: [
        'Pasaporte panameño válido por 5 años',
        'Debe presentarse en persona en el consulado',
        'Tarifa reducida para jubilados (mujeres 55+, hombres 60+)',
        'El procesamiento desde consulados toma 20-30 días'
      ]
    }
  },
  PY: {
    countryCode: 'PY',
    countryName: 'Paraguay',
    countryNameEs: 'Paraguay',
    consulateCity: 'Asunción',
    consulateAddress: 'Calle Yegros 437, Asunción',
    consulatePhone: '+595 21 490 686',
    consulateEmail: 'emb.asuncion@maec.es',
    consulateWebsite: 'https://www.exteriores.gob.es/Embajadas/asuncion',
    appointmentUrl: 'https://app.bookitit.com/es/hosteds/widgetdefault/ac3d4e5f6a7b',
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
        descriptionEs: 'Formulario de solicitud completado',
        required: true
      },
      {
        id: 'photo',
        name: 'Recent photos',
        nameEs: 'Fotografías recientes',
        description: '2 recent passport-size photos',
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
        description: 'Health insurance valid in Spain',
        descriptionEs: 'Seguro médico válido en España',
        required: true
      },
      {
        id: 'criminal',
        name: 'Criminal record certificate',
        nameEs: 'Antecedentes penales',
        description: 'Criminal record certificate, apostilled',
        descriptionEs: 'Certificado de antecedentes penales apostillado',
        required: true
      },
      {
        id: 'medical',
        name: 'Medical certificate',
        nameEs: 'Certificado médico',
        description: 'Medical certificate',
        descriptionEs: 'Certificado médico',
        required: true
      }
    ],
    additionalNotes: 'Paraguay is part of the Hague Apostille Convention. Processing time is approximately 1 month.',
    additionalNotesEs: 'Paraguay es parte del Convenio de la Apostilla de La Haya. El tiempo de tramitación es aproximadamente 1 mes.',
    passport: {
      validityMonths: 6,
      blankPages: 2,
      passportOffice: 'Departamento de Identificaciones de la Policía Nacional',
      passportOfficeWebsite: 'https://www.policianacional.gov.py/',
      renewalProcessingDays: '7-15',
      renewalFee: 'USD $55 (Consular passport)',
      renewalDocuments: [
        'Cédula de Identidad Civil Paraguaya',
        'Previous passport (or copy if expired)',
        'Proof of residence in consular jurisdiction',
        'Application form',
        'Biometric data capture (fingerprints, iris)'
      ],
      consulateInSpain: {
        city: 'Madrid',
        address: 'Paseo de la Castellana 169, 28046 Madrid',
        phone: '+34 91 345 2495',
        email: 'embapar.mad@mre.gov.py',
        website: 'https://www.mre.gov.py/'
      },
      apostilleAuthority: 'Ministerio de Relaciones Exteriores',
      apostilleProcessingDays: '1-3',
      apostilleFee: 'PYG 50,000',
      apostilleDocuments: [
        'Birth certificate',
        'Criminal record certificate',
        'Academic transcripts and diplomas',
        'Medical certificate'
      ],
      notes: [
        'Paraguayan consular passport issued for residents abroad',
        'Biometric data required since September 2018',
        'Must appear in person at consulate',
        'Passport holders can access 145 countries visa-free'
      ],
      notesEs: [
        'Pasaporte consular paraguayo emitido para residentes en el exterior',
        'Datos biométricos requeridos desde septiembre 2018',
        'Debe presentarse en persona en el consulado',
        'Los titulares pueden acceder a 145 países sin visa'
      ]
    }
  }
}

export const countryOptions = Object.values(visaRequirements).map(country => ({
  code: country.countryCode,
  name: country.countryName,
  nameEs: country.countryNameEs
}))

export const supportedCountries = countryOptions
