'use client';

export function LuxurySkeleton({ type }: { type: 'hero' | 'list-item' | 'inbox' }) {
  if (type === 'hero') {
    return (
      <div className="panel-titanium rounded-xl p-8 flex flex-col items-center justify-center animate-pulse space-y-6 w-full max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-zinc-800/50" />
        <div className="h-8 w-64 bg-zinc-800/50 rounded-md" />
        <div className="flex gap-4 w-full justify-center">
          <div className="h-10 w-24 bg-zinc-800/50 rounded-md" />
          <div className="h-10 w-24 bg-zinc-800/50 rounded-md" />
        </div>
      </div>
    );
  }

  if (type === 'list-item') {
    return (
      <div className="panel-titanium rounded-lg p-4 flex flex-col gap-3 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800/50" />
            <div className="h-4 w-32 bg-zinc-800/50 rounded-md" />
          </div>
          <div className="h-3 w-16 bg-zinc-800/50 rounded-md" />
        </div>
        <div className="h-4 w-3/4 bg-zinc-800/50 rounded-md" />
        <div className="h-10 w-full bg-zinc-800/50 rounded-md" />
      </div>
    );
  }

  if (type === 'inbox') {
    return (
      <div className="flex-1 flex flex-col h-full animate-pulse p-6 space-y-6">
        <div className="h-8 w-48 bg-zinc-800/50 rounded-md" />
        <div className="panel-titanium-inset flex-1 rounded-lg p-6 space-y-4">
          <div className="h-4 w-full bg-zinc-800/50 rounded-md" />
          <div className="h-4 w-5/6 bg-zinc-800/50 rounded-md" />
          <div className="h-4 w-4/6 bg-zinc-800/50 rounded-md" />
        </div>
      </div>
    );
  }

  return null;
}
