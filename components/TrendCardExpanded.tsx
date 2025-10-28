export default function TrendCardExpanded({ item }: { item: any }) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5">
      <div className="font-medium">{item.trend_name}</div>
      <div className="mt-1 text-sm text-white/70">Score: {item.sources?.reduce((s: number, x: any) => s + (x.score || 0), 0)}</div>
      {item.amazon?.[0] && (
        <a href={item.amazon[0].url} target="_blank" className="mt-2 inline-block text-sm text-neon-teal underline">
          Amazon: {item.amazon[0].title}
        </a>
      )}
    </div>
  );
}

