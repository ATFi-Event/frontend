import ComingSoonPage from "@/components/features/ComingSoonPage";
import Link from "next/link";

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const { slug } = params;

  return (
    <>
      <ComingSoonPage />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 border-b">
          <h1 className="text-xl font-bold">Event: {slug}</h1>
        </header>

        <div className="flex flex-1">
          {/* Sidebar / Tabs */}
          <aside className="w-48 border-r p-4 space-y-2">
            <nav className="flex flex-col gap-2">
              <Link
                href={`/event/manage/${slug}/overview`}
                className="hover:underline"
              >
                Overview
              </Link>
              <Link
                href={`/event/manage/${slug}/guests`}
                className="hover:underline"
              >
                Guests
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
