export default function CheckinPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <h1>Checkin Page</h1>
      <p>Slug : {slug}</p>
    </div>
  );
}
