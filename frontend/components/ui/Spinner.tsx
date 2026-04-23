interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function Spinner({ size = "md", label }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`
        ${sizes[size]} rounded-full border-gray-700 border-t-cyan-500 animate-spin
      `} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}