function App() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <h1 className="text-3xl font-bold">Task Manager</h1>
      <p className="mt-2 text-slate-600">
        API: {import.meta.env.VITE_API_URL ?? 'VITE_API_URL is not set'}
      </p>
    </main>
  )
}

export default App
