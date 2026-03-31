export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="p-8 bg-white border border-slate-200 rounded shadow-sm text-center">
        <h1 className="text-xl font-semibold mb-4">MOCK LOGIN</h1>
        <p className="text-sm text-slate-500 mb-6">In the actual app, enter your credentials.</p>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors w-full">
          Sign In
        </button>
      </div>
    </div>
  )
}
