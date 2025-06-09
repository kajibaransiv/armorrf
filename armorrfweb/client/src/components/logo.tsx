export default function Logo({ className = "text-2xl" }: { className?: string }) {
  return (
    <div className={`font-serif font-bold tracking-tight ${className}`}>
      ArmorRF
    </div>
  );
}
