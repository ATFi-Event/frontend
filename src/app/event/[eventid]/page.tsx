import EventDetail from "@/components/features/events/EventDetail";

export default async function EventPage({ params }: { params: Promise<{ eventid: string }> }) {
  const { eventid } = await params;
  return <EventDetail eventId={eventid} />;
}