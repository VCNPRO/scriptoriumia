export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative">
      {/* Fondo sutil */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Header elegante y discreto */}
      <header className="relative z-50 border-b border-gray-800/50 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded flex items-center justify-center">
                <span className="text-gray-100 font-medium text-sm">S</span>
              </div>
              <div>
                <h1 className="text-lg font-medium text-gray-100">Scriptorium AI</h1>
                <p className="text-xs text-gray-400">Enterprise Solutions</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-6">
              <a href="#soluciones" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Soluciones
              </a>
              <a href="#instituciones" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Instituciones
              </a>
              <a href="#seguridad" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Seguridad
              </a>
              <button className="institutional-button-primary">
                Consulta
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section refinado */}
      <section className="relative py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge sutil */}
            <div className="inline-flex items-center bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-300 font-medium">
                Certificado • ISO 27001 • GDPR Compliant
              </span>
            </div>

            {/* Título principal elegante */}
            <h1 className="text-3xl lg:text-4xl font-medium mb-6 leading-tight text-gray-100">
              Digitalización Documental de
              <br />
              <span className="text-gray-300">Fondos Históricos</span>
            </h1>

            {/* Subtítulo refinado */}
            <p className="text-lg text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Plataforma especializada en transcripción y análisis de documentos manuscritos
              para bibliotecas nacionales, archivos históricos y administraciones públicas.
            </p>

            {/* CTA Buttons discretos */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a href="/dashboard" className="institutional-button-primary text-center">
                Acceder al Dashboard
              </a>
              <button className="institutional-button-secondary">
                Solicitar Demo
              </button>
            </div>

            {/* Métricas discretas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-800/50">
              <div className="text-center">
                <div className="text-2xl font-medium text-gray-200 mb-1">50M+</div>
                <div className="text-sm text-gray-500">Documentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium text-gray-200 mb-1">200+</div>
                <div className="text-sm text-gray-500">Instituciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium text-gray-200 mb-1">99.9%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium text-gray-200 mb-1">45</div>
                <div className="text-sm text-gray-500">Países</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separador sutil */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent max-w-4xl mx-auto"></div>

      {/* Sección de Soluciones elegante */}
      <section id="soluciones" className="py-16 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-medium mb-4 text-gray-100">
              Soluciones Especializadas
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tecnología adaptada a las necesidades específicas de instituciones patrimoniales.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bibliotecas Nacionales */}
            <div className="institutional-card p-6 rounded-lg">
              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-gray-100">Bibliotecas Nacionales</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Digitalización de manuscritos históricos e incunables.
                Procesamiento hasta 10,000 documentos diarios.
              </p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>• Manuscritos medievales</li>
                <li>• Catalogación MARC21</li>
                <li>• Metadatos Dublin Core</li>
              </ul>
            </div>

            {/* Archivos Históricos */}
            <div className="institutional-card p-6 rounded-lg">
              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-gray-100">Archivos Históricos</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Preservación de protocolos notariales y expedientes.
                Análisis de series documentales.
              </p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>• Protocolos s. XVI-XX</li>
                <li>• Expedientes administrativos</li>
                <li>• Análisis diplomático</li>
              </ul>
            </div>

            {/* Administraciones Públicas */}
            <div className="institutional-card p-6 rounded-lg">
              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-gray-100">Administraciones</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Modernización de archivos gubernamentales.
                Cumplimiento normativo estricto.
              </p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>• Expedientes gubernamentales</li>
                <li>• Cumplimiento GDPR</li>
                <li>• Auditoría completa</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent max-w-4xl mx-auto"></div>

      {/* Capacidades técnicas */}
      <section id="instituciones" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-medium mb-4 text-gray-100">
              Capacidades Técnicas
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tecnología para procesamiento masivo y preservación digital.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-100 mb-2">Procesamiento Industrial</h3>
                  <p className="text-sm text-gray-400">
                    Infraestructura que procesa hasta 50,000 documentos diarios con IA especializada.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-100 mb-2">Estándares</h3>
                  <p className="text-sm text-gray-400">
                    Cumplimiento con OAIS, PREMIS, METS y estándares de preservación digital.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-100 mb-2">IA Especializada</h3>
                  <p className="text-sm text-gray-400">
                    Modelos entrenados en documentación histórica iberoamericana.
                  </p>
                </div>
              </div>
            </div>

            <div className="institutional-card p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Especificaciones</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Procesamiento</span>
                  <span className="text-gray-200">50,000 docs/día</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Precisión OCR</span>
                  <span className="text-gray-200">99.7%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Formatos</span>
                  <span className="text-gray-200">PDF, TIFF, JPEG</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Resolución</span>
                  <span className="text-gray-200">600 DPI</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Idiomas</span>
                  <span className="text-gray-200">ES, LA, CA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">SLA</span>
                  <span className="text-gray-200">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent max-w-4xl mx-auto"></div>

      {/* Seguridad */}
      <section id="seguridad" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-medium mb-4 text-gray-100">
              Seguridad y Compliance
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Máximos estándares para instituciones públicas y patrimoniales.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="institutional-card p-6 rounded-lg">
              <h3 className="text-base font-medium text-gray-100 mb-4">Certificaciones</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  ISO 27001:2013
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  SOC 2 Type II
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  GDPR Compliant
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  ENS
                </li>
              </ul>
            </div>

            <div className="institutional-card p-6 rounded-lg">
              <h3 className="text-base font-medium text-gray-100 mb-4">Infraestructura</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Centros datos UE
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Cifrado AES-256
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Backups 3-2-1
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Red privada
                </li>
              </ul>
            </div>

            <div className="institutional-card p-6 rounded-lg">
              <h3 className="text-base font-medium text-gray-100 mb-4">Auditoría</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Trazabilidad completa
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Logs inmutables
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Informes automáticos
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Control RBAC
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent max-w-4xl mx-auto"></div>

      {/* Estado del sistema discreto */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="institutional-card p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-gray-100 mb-2">Estado del Sistema</h2>
              <p className="text-sm text-gray-400">Monitorización 24/7</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-base font-medium text-gray-100 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Servicios Operativos
                </h3>
                <div className="space-y-2">
                  {[
                    "Motor de Transcripción",
                    "Análisis Paleográfico",
                    "API Enterprise",
                    "Sistema de Auditoría"
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{service}</span>
                      <span className="text-emerald-500 text-xs">Operativo</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-100 mb-4">Métricas Tiempo Real</h3>
                <div className="space-y-2">
                  {[
                    { label: "Docs procesados hoy", value: "12,847" },
                    { label: "Tiempo procesamiento", value: "2.3s" },
                    { label: "Precisión promedio", value: "99.7%" },
                    { label: "Uptime mes", value: "99.97%" }
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{metric.label}</span>
                      <span className="text-gray-200">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="py-12 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-gray-300 text-xs font-medium">S</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-200">Scriptorium AI</h3>
                <p className="text-xs text-gray-500">Enterprise Solutions</p>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              © 2024 Scriptorium AI • scriptoriumia.eu • ISO 27001 • GDPR
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}