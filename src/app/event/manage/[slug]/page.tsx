import OverviewContent from "@/components/features/manage-event/OverviewContent";
import ManageContent from "@/components/features/manage-event/ManageContent";

export default function EventRoutePage() {
  return (
    <div>
      <ManageContent path="overview" />
      <OverviewContent />
    </div>
  );
}
