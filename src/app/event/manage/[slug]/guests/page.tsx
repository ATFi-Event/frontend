import ManageContent from "@/components/features/manage-event/ManageContent";
import GuestContent from "@/components/features/manage-event/GuestContent";

export default function GuestsRouterage() {
  return (
    <div>
      <ManageContent path="guests" />
      <GuestContent />
    </div>
  );
}
