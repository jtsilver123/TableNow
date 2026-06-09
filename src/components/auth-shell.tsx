import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Leader } from "@/components/ui/leader";

/** Two-column auth layout: editorial left panel, form on the right. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left — editorial panel */}
      <div className="relative hidden flex-col justify-between border-r border-line bg-ivory-50/70 p-12 md:flex md:w-[44%] lg:w-1/2">
        <Link href="/">
          <Logo />
        </Link>
        <div className="max-w-md">
          <p className="eyebrow mb-4">Table availability alerts</p>
          <h1 className="text-4xl leading-tight lg:text-5xl">
            Be first to know the moment a table opens.
          </h1>
          <div className="mt-10 max-w-sm">
            <Leader label="Free plan" value="3 active watches" emphasis />
            <Leader label="Alerts" value="The second a table opens" emphasis />
            <Leader label="Booking" value="One tap, your account" />
          </div>
        </div>
        <p className="text-sm text-ink-400">
          We alert. You book. We never act on your account.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
