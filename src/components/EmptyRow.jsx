export default function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-6 text-center text-sm text-gray-500">
        {message}
      </td>
    </tr>
  );
}
