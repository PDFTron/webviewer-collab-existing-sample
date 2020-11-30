import React, { useCallback } from 'react';
import InviteList from './InviteList';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, ModalHeader } from '@chakra-ui/core';

export default function InviteModal ({
  onClose,
  isOpen,
  document,
  client
}) {

  const submit = useCallback(async (user) => {
    if(!user) onClose();
    await client.inviteUsersToDocument(document.id, [user]);
    onClose();
  }, [client, document])

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
        <ModalContent>
        <ModalHeader>Invite People</ModalHeader>
        <ModalCloseButton />
          <ModalBody>
            <InviteList onSubmit={submit} />
          </ModalBody>
      </ModalContent>
    </Modal>
  )

}