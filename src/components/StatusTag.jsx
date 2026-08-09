export default function StatusTag({ status }) {
  const map = {
    Active: "text-green-700",
    "Fail-Safe": "text-yellow-700",
    "Not Working": "text-red-700",
  };

  return <span className={`font-medium ${map[status] || ""}`}>{status}</span>;
}
