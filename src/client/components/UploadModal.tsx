import React, { PropsWithChildren, useState, useEffect } from 'react';
import { Button,FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/core';
import { useForm } from 'react-hook-form';
import CollabClient from '@pdftron/collab-client';

interface UploadModalProps {
  onComplete: (doc) => void;
  isOpen: boolean;
  onClose: () => void;
  client: CollabClient;
}

export default function UploadModal(props: PropsWithChildren<UploadModalProps>) {
  const { isOpen, onClose, onComplete, client} = props;
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
    const user = JSON.stringify(client.currentUser);
    data.append('file', fileObj);
    data.append('name', name);
    data.append('user', user);
    const resp = await fetch('http://localhost:3000/api/documents', {
      method: 'post',
      credentials: 'include',
      body: data
    });
    let doc;
    if(resp.status === 200) {
      doc = await resp.json();
      //load here to get document members and annotation members created, so that GET documents can work
      await client.loadDocument(`http://localhost:3000${doc.url}`, {
        documentId: doc.id,
        filename: doc.name
      });
    }
    onComplete(doc);
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
