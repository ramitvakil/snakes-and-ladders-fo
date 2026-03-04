export default function Loading({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-emerald-400" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
