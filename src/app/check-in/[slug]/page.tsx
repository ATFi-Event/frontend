import ComingSoonPage from "@/components/features/ComingSoonPage";

export default function CheckinPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <ComingSoonPage />  
      {/* <h1>Checkin Page</h1>
      <p>Slug : {slug}</p> */}
    </div>
  );
}
