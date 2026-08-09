export default function StatCard({ label, value, note }) {
  return (
    <div className="border border-gray-300 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  );
}
