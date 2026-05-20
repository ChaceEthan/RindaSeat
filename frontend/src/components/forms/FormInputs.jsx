// @ts-nocheck
import { motion } from 'framer-motion';

export const TextInput = ({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </label>
      )}
      <motion.input
        type={type}
        className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const Checkbox = ({ label, checked, onChange, className = '' }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-primary-600 cursor-pointer"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
};

export const Select = ({
  label,
  options,
  value,
  onChange,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const FormGroup = ({ children, className = '' }) => {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
};

export default TextInput;
