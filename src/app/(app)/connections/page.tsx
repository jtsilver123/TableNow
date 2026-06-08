"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Leader } from "@/components/ui/leader";
import { PlatformBadge, PlatformLogo } from "@/components/ui/platform-logo";
import { ConnectAccountModal } from "@/components/connections/connect-account-modal";
import { useHydrated } from "@/components/hydrated";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ConnectedAccount, Platform } from "@/lib/types";

export default function ConnectionsPage() {
  const hydrated = useHydrated();
  const connections = useStore((s) => s.connections);
  const disconnectAccount = useStore((s) => s.disconnectAccount);
  const checkConnection = useStore((s) => s.checkConnection);
  const [connectProvider, setConnectProvider] = useState<Platform | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-5 py-7 sm:px-8">
      <p className="eyebrow mb-2">Connections</p>
      <h2 className="font-serif text-3xl text-ink-900">Your booking accounts</h2>
      <p className="mt-2 max-w-lg text-sm text-ink-500">
        Connect your account so we can book using your own profile. We never see your password,
        never create fake accounts, and never resell reservations.
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
              onConnect={() => setConnectProvider(p)}
              onReconnect={() => setConnectProvider(p)}
              onDisconnect={() => disconnectAccount(p)}
              onCheck={() => checkConnection(p)}
            />
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-line bg-ivory-50 px-5 py-4 text-[13px] text-ink-500">
        Requests for a platform you haven&apos;t connected can be saved as drafts, but can&apos;t be
        activated until the account is connected.
      </div>

      <ConnectAccountModal provider={connectProvider} onClose={() => setConnectProvider(null)} />
    </div>
  );
}

function ConnectionCard({
  provider,
  connection,
  hydrated,
  onConnect,
  onReconnect,
  onDisconnect,
  onCheck,
}: {
  provider: Platform;
  connection?: ConnectedAccount;
  hydrated: boolean;
  onConnect: () => void;
  onReconnect: () => void;
  onDisconnect: () => void;
  onCheck: () => void;
}) {
  const status = hydrated ? connection?.status ?? "disconnected" : "disconnected";
  const connected = status === "connected";
  const needsReconnect = status === "needs_reconnect";
  const [checking, setChecking] = useState(false);

  async function handleCheck() {
    setChecking(true);
    await onCheck();
    setChecking(false);
  }

  const dot = connected ? "bg-sage-500" : needsReconnect ? "bg-clay-500" : "bg-ink-300";
  const statusLabel = connected ? "Connected" : needsReconnect ? "Needs reconnect" : "Not connected";
  const statusColor = connected ? "text-sage-600" : needsReconnect ? "text-clay-600" : "text-ink-400";

  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlatformBadge platform={provider} className={cn("h-11 w-11 text-lg", !connected && "opacity-60")} />
          <div>
            <PlatformLogo platform={provider} className="text-base" />
            <p className="flex items-center gap-1.5 text-[12px]">
              <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
              <span className={statusColor}>{statusLabel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connected && (
            <Button variant="ghost" size="sm" onClick={handleCheck} disabled={checking}>
              {checking ? "Checking…" : "Test"}
            </Button>
          )}
          {connected ? (
            <Button variant="secondary" size="sm" onClick={onDisconnect}>
              Disconnect
            </Button>
          ) : needsReconnect ? (
            <Button size="sm" onClick={onReconnect}>
              Reconnect
            </Button>
          ) : (
            <Button size="sm" onClick={onConnect}>
              Connect
            </Button>
          )}
        </div>
      </div>

      {(connected || needsReconnect) && (
        <div className="mt-4 border-t border-line pt-2">
          <Leader label="Account" value={connection?.account_label ?? "—"} />
          <Leader label="Last checked" value={formatRelative(connection?.last_checked_at ?? null)} />
          <Leader
            label="Connection health"
            value={
              connected ? (
                <span className="text-sage-600">Healthy</span>
              ) : (
                <span className="text-clay-600">Action needed</span>
              )
            }
          />
        </div>
      )}
    </div>
  );
}
