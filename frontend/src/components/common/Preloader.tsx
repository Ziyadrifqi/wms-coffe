export default function Preloader() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm text-gray-500 font-medium">Memuat WMS Coffee...</p>
    </div>
  );
}