"use client";

import { Progress } from "flowbite-react";
import ButtonCustom from "../ui/ButtonCustom";
import CardGuest from "../ui/CardGuests";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GuestsEventOverview() {
  // Cap
  const registeredNumber = 2;
  const cap = 10;
  const numberProgress = Math.min(100, (registeredNumber / cap) * 100);

  // Path
  const params = useParams();
  const slug = params.slug;
  const basePath = `/event/manage/${slug}`;

  return (
    <section className="flexx flex-col gap-3">
      <h1 className="text-2xl font-semibold">At a Glance</h1>
      <div className="flex justify-between">
        <p className="text-green-500 font-normal mb-3">
          <span className="text-xl">{registeredNumber}</span> guest
        </p>
        <p className="text-gray-500">
          cap <span className="text-xl">{cap}</span>
        </p>
      </div>
      <div>
        <Progress progress={numberProgress} color="green" />
        <p className="text-green-500 mt-2">
          • {registeredNumber} approve this event
        </p>
      </div>

      <div className="flex justify-between items-center w-full mb-3">
        <h1 className="text-2xl font-semibold mt-3">Recent Registration</h1>
        <Link href={`${basePath}/guests`}>
          <ButtonCustom type="arrow" content="All Guest"></ButtonCustom>
        </Link>
      </div>
      {/* Map Data */}
      <div className="flex flex-col gap-2">
        <CardGuest
          name="Kuro - Name"
          email="kuro@example.com - Email"
          accept
        ></CardGuest>
        <CardGuest name="Shiro" email="shiro@example.com"></CardGuest>
      </div>
    </section>
  );
}
