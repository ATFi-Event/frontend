"use client";

import {
  Avatar,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import ButtonCustom from "../ui/ButtonCustom";
import CardHosts from "../ui/CardHosts";
import { useState } from "react";
import Image from "next/image";

export default function HostEventOverview() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <section className="flexx flex-col">
        <div className="mb-3">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-semibold mt-3">Hosts</h1>
            <ButtonCustom
              type="plus"
              content="Add Host"
              onClick={() => setOpenModal(true)}
            ></ButtonCustom>
          </div>
          <p>Add hosts, special guests, and event managers.</p>
        </div>

        {/* Map Data */}
        <div className="flex flex-col gap-2">
          <CardHosts name="Kuro" email="kuro@example.com"></CardHosts>
        </div>
      </section>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader>Add Host</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Add a host to highlight them on the event page or to get help
              managing the event.
            </p>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email1">Your email</Label>
              </div>
              <TextInput id="email1" type="email" placeholder="" />
            </div>
            {/* Hasil User */}
            <div>
              {/* Start Card */}
              <div className="flex items-center space-x-4 hover:bg-gray-400 py-1 rounded-lg">
                <div className="shrink-0">
                  <Avatar img="" alt="avatar of Jese" rounded size="md" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    Jhon Doe
                  </p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    email@windster.com
                  </p>
                </div>
              </div>
              {/* End Card */}
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
