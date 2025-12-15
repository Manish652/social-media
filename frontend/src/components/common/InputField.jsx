export default function InputField({ label, name, type = "text", value, onChange, placeholder, ...props }) {
  return (
    <div className="flex flex-col mb-3">
      <label className="text-sm font-semibold mb-1" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={type === "file" ? undefined : value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}
