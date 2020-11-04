import React, { PropsWithChildren, useState, useEffect } from 'react';
import { Button,FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/core';
import { useForm } from 'react-hook-form';

interface UploadModalProps {
  onComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal(props: PropsWithChildren<UploadModalProps>) {
  const { isOpen, onClose, onComplete } = props;
  const { register, handleSubmit, setValue} = useForm();
  const [name, setName] = useState('');
  const selectedFile = (e) => {
    const file: File = e.target.files[0];
    setName(file.name);
    setValue('name', file.name);
  }

  useEffect(() => {
    return (() => {
      setName('');
    })
  },[isOpen]);

  const onSubmit = async (values) => {
    const { file, name } = values;
    const data = new FormData();
    const fileObj: File = file[0];
    data.append('file', fileObj);
    data.append('name', name);
    const resp = await fetch('http://localhost:3000/api/documents', {
      method: 'post',
      credentials: 'include',
      body: data
    });
    onComplete();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl isRequired>
                <FormLabel>Select a file</FormLabel>
                <Input type='file' name='file' ref={register()} onChange={selectedFile} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input type='text' name='name' ref={register()} defaultValue={name} />
              </FormControl>
              
              <Button marginTop='10px' type='submit'>Submit</Button>
            </form>
            
          </ModalBody>
        </ModalContent>
      </Modal>
  );
}
