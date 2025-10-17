import Navbar from "@/components/organism/Navbar";

export default function EventRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navbar Login */}
      <Navbar active="none" />
      {/* Main content */}
      <main>{children}</main>
    </>
  );
}
