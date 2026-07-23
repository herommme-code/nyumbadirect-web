import React from 'react'

export default function FormField({ id, label, type = 'text', value, onChange, autoComplete, ...props }) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="sr-only">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        autoComplete={autoComplete}
        className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
        {...props}
      />
    </label>
  )
}
