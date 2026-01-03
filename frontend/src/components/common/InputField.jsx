export default function InputField({ label, name, type = "text", value, onChange, placeholder, ...props }) {
  return (
    <div className="flex flex-col mb-4">
      <label className="text-sm font-semibold text-gray-700 mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={type === "file" ? undefined : value}
        onChange={onChange}
        placeholder={placeholder}
        className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
        {...props}
      />
    </div>
  );
}
