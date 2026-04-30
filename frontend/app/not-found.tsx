import Link from "next/link";

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Go back home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
