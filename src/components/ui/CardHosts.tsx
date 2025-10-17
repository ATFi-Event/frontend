"use client";

import {
  Avatar,
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useState } from "react";

type Props = {
  name: string;
  email: string;
};

export default function CardHosts({ name, email }: Props) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center p-3  bg-gray-700 rounded-xl border border-gray-600">
        {/* Data User */}
        <div className="flex gap-3 text-sm items-center">
          <Avatar img="" alt="avatar of Jese" rounded size="xs" />
          <h1 className="text-gray-200">{name}</h1>
          <h2 className="text-gray-400">{email}</h2>
          <Badge color="success">Creator</Badge>
        </div>
        {/* Data Approve dan Regsitered Time  */}
        <div className="text-base flex gap-2 items-center">
          <button
            onClick={() => setOpenModal(true)}
            className="px-[10px] py-[7px] rounded-lg bg-[#2a2b2c] text-[#a4abb1] hover:bg-[#a4abb1] hover:text-[#2a2b2c] flex items-center gap-1 text-[12px] transition duration-100 ease-in"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>

        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <ModalHeader>Terms of Service</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                With less than a month to go before the European Union enacts
                new consumer privacy laws for its citizens, companies around the
                world are updating their terms of service agreements to comply.
              </p>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                The European Union’s General Data Protection Regulation
                (G.D.P.R.) goes into effect on May 25 and is meant to ensure a
                common set of data rights in the European Union. It requires
                organizations to notify users as soon as possible of high-risk
                data breaches that could personally affect them.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setOpenModal(false)}>I accept</Button>
            <Button color="alternative" onClick={() => setOpenModal(false)}>
              Decline
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
}
