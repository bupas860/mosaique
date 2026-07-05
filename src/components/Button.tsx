type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        rounded-lg
        bg-blue-600
        px-6
        py-3
        text-lg
        font-semibold
        text-white
        transition
        hover:bg-blue-700
      "
    >
      {children}
    </button>
  );
}
