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
          <p className="eyebrow mb-4">Your private dining concierge</p>
          <h1 className="text-4xl leading-tight lg:text-5xl">
            The table you want, booked the moment it opens.
          </h1>
          <div className="mt-10 max-w-sm">
            <Leader label="New members" value="1 free credit" emphasis />
            <Leader label="First booking" value="Always free" emphasis />
            <Leader label="Failed attempt" value="0 credits" />
          </div>
        </div>
        <p className="text-sm text-ink-400">
          No resale. No fake accounts. No credit used unless we book.
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
