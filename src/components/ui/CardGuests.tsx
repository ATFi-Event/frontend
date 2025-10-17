import { Avatar, Badge } from "flowbite-react";

type Props = {
  name: string;
  email: string;
};

export default function CardGuest({ name, email }: Props) {
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
        <Badge color="success">Going</Badge>
        <h1 className="text-gray-400">Yesterday</h1>
      </div>
    </div>
  );
}
