type ButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
};

const variantClasses = {
  primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
  secondary: "border border-slate-400 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-800",
  ghost: "bg-transparent text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-blue-800",
};

export default function Button({ children, onClick, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-6 py-3 text-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}
