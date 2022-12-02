export default function InputField({
  children,
  id,
  type,
  value,
  className,
  onChange,
  placeholder,
  required,
  name,
}: any) {
  return (
    <label
      className={`block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 ${className}`}
    >
      <p>{children}</p>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        type={type ? type : "text"}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        id={id}
        placeholder={placeholder}
        required={required}
        name={name}
      />
    </label>
  );
}
