import React, { useState } from 'react'
import { FormControl, FormLabel, Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalOverlay, ModalHeader, ModalCloseButton } from '@chakra-ui/core';
import { useForm } from 'react-hook-form';

export default function FileEdit({
  onClose,
  isOpen,
  document,
  client
}){

  const { register, handleSubmit } = useForm();
  const [loading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(document?.isPublic || false);

  const onSubmit = async (event) => {
    setIsLoading(true);
    const { name, isPublic } = event;
    await client.editDocument(document.id, {
      name,
      isPublic
    })
    setIsLoading(false);
    onClose();
  }

  return (

    <Modal onClose={onClose} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Document</ModalHeader>
          <ModalCloseButton />
        <ModalBody>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <FormLabel htmlFor='file-name'>Document name</FormLabel>
          <Input id='file-name' type='text' name='name' ref={register()} defaultValue={document?.name} />  
        </FormControl>
        <FormControl>
          <Checkbox id='is-public' name='isPublic' margin={{ top: '10px' }} isChecked={isPublic} ref={register()} onChange={e => setIsPublic(e.target.checked)}>isPublic?</Checkbox>
        </FormControl>
        <Button type='submit' margin={{ top: '10px' }} style={{width: '100%'}}>Save changes</Button>
      </form>
      </ModalBody>
      </ModalContent>
    </Modal>
  )
}