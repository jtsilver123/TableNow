"use client";

import { Button } from "@/components/ui/button";
import { Leader } from "@/components/ui/leader";
import { ConnectionIcon } from "@/components/icons";
import { useHydrated } from "@/components/hydrated";
import { cn } from "@/lib/cn";
import { PLATFORM_LABEL } from "@/lib/status";
import { formatRelative } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ConnectedAccount, Platform } from "@/lib/types";

export default function ConnectionsPage() {
  const hydrated = useHydrated();
  const connections = useStore((s) => s.connections);
  const connectAccount = useStore((s) => s.connectAccount);
  const disconnectAccount = useStore((s) => s.disconnectAccount);

  return (
    <div className="mx-auto max-w-2xl px-5 py-7 sm:px-8">
      <p className="eyebrow mb-2">Connections</p>
      <h2 className="font-serif text-3xl text-ink-900">Your booking accounts</h2>
      <p className="mt-2 max-w-lg text-sm text-ink-500">
        Connect your account so we can book using your own profile. We never create fake accounts or
        resell reservations.
      </p>

      <div className="mt-7 space-y-4">
        {(["resy", "opentable"] as Platform[]).map((p) => {
          const conn = connections.find((c) => c.provider === p);
          return (
            <ConnectionCard
              key={p}
              provider={p}
              connection={conn}
              hydrated={hydrated}
              onConnect={() => connectAccount(p)}
              onDisconnect={() => disconnectAccount(p)}
            />
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-line bg-ivory-50 px-5 py-4 text-[13px] text-ink-500">
        Requests for a platform you haven&apos;t connected can be saved as drafts, but can&apos;t be
        activated until the account is connected.
      </div>
    </div>
  );
}

function ConnectionCard({
  provider,
  connection,
  hydrated,
  onConnect,
  onDisconnect,
}: {
  provider: Platform;
  connection?: ConnectedAccount;
  hydrated: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const connected = hydrated && connection?.status === "connected";

  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", connected ? "bg-sage-100 text-sage-600" : "bg-ivory-200 text-ink-400")}>
            <ConnectionIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium text-ink-900">{PLATFORM_LABEL[provider]}</p>
            <p className="flex items-center gap-1.5 text-[12px]">
              <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-sage-500" : "bg-ink-300")} />
              <span className={connected ? "text-sage-600" : "text-ink-400"}>
                {connected ? "Connected" : "Not connected"}
              </span>
            </p>
          </div>
        </div>
        {connected ? (
          <Button variant="secondary" size="sm" onClick={onDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button size="sm" onClick={onConnect}>
            Connect
          </Button>
        )}
      </div>

      {connected && (
        <div className="mt-4 border-t border-line pt-2">
          <Leader label="Account" value={connection?.account_label ?? "—"} />
          <Leader label="Last checked" value={formatRelative(connection?.last_checked_at ?? null)} />
          <Leader label="Connection health" value={<span className="text-sage-600">Healthy</span>} />
        </div>
      )}
    </div>
  );
}
