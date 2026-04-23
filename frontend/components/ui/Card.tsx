interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function Card({ children, className = "", glow = false }: CardProps) {
  return (
    <div className={`
      relative bg-gray-900 border border-gray-800 rounded-2xl p-6
      ${glow ? "shadow-lg shadow-cyan-500/10 border-cyan-500/20" : ""}
      ${className}
    `}>
      {children}
    </div>
  );
}