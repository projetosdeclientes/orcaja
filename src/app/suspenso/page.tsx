import Link from 'next/link'

export default function SuspensoPage() {
  const suporte = process.env.NEXT_PUBLIC_SUPORTE_WHATSAPP ?? '5511999999999'
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Acesso suspenso</h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          O acesso da sua empresa est{`a`} temporariamente suspenso. Entre em contato com o suporte para regularizar.
        </p>
        <a
          href={`https://wa.me/${suporte}?text=${encodeURIComponent('Ol{`a`}! Minha empresa est{`a`} com o acesso suspenso no Or{`c`}aJ{`a`}.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-green-500"
        >
          Falar com o suporte
        </a>
      </div>
    </div>
  )
}
