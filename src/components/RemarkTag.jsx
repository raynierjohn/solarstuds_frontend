export default function RemarkTag({ over }) {
  return (
    <span className={over ? "text-red-700 font-medium" : "text-gray-600"}>
      {over ? "Overspeeding" : "Normal"}
    </span>
  );
}
