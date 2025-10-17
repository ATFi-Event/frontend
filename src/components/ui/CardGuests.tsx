import { Avatar, Badge } from "flowbite-react";

type Props = {
  name: string;
  email: string;
  accept?: boolean;
};

export default function CardGuest({ name, email, accept }: Props) {
  return (
    <div className="flex justify-between items-center p-3  bg-gray-700 rounded-xl border border-gray-600">
      {/* Data User */}
      <div className="flex gap-3 text-sm items-center">
        <Avatar img="" alt="avatar of Jese" rounded size="xs" />
        <h1 className="text-gray-200">{name}</h1>
        <h2 className="text-gray-400">{email}</h2>
      </div>
      {/* Data Approve dan Regsitered Time  */}
      <div className="text-base flex gap-2 items-center">
        {accept ? (
          <Badge color="success">Going</Badge>
        ) : (
          <section className="flex items-center gap-3">
            <div className="text-green-500 text-base flex items-center hover:text-green-300 cursor-pointer">
              <span className="material-symbols-outlined">check</span>
              Approve
            </div>
            <div className="text-red-500 text-base flex items-center hover:text-red-300 cursor-pointer">
              <span className="material-symbols-outlined">close</span>
              Decline
            </div>
          </section>
        )}

        <h1 className="text-gray-400">Yesterday</h1>
      </div>
    </div>
  );
}
