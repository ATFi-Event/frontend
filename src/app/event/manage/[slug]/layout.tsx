import Navbar from "@/components/organism/Navbar";

export default function EventRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#131517] min-h-screen">
      {/* Navbar Login */}
      <Navbar active="none" />
      {/* Main content */}
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
