export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="text-8xl font-black text-gradient mb-4">404</div>
        <p className="text-slate-400 mb-6">Page not found</p>
        <a
          href="/feed"
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold transition"
        >
          Go to Feed
        </a>
      </div>
    </div>
  );
}
