import React, { useState } from 'react';
import { Text, Button, Flex } from '@chakra-ui/core';
import InviteModal from './InviteModal';
import FileEdit from './FileEdit';

export default function TopNav ({
  client,
  currentDocument
}) {

  const [showFileEdit, setShowFileEdit] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  return (
    <Flex justifyContent='flex-end' alignItems='center' height='50px'>
      <Flex direction='row' marginLeft={'20px'} flexGrow={1} height='100%'>
      {
        currentDocument &&
        <Text fontSize='lg' m={3} >{currentDocument.name}</Text>
      }
      </Flex>

        <FileEdit
          onClose={() => setShowFileEdit(false)}
          document={currentDocument}
          client={client}
          isOpen={showFileEdit}
        />

        <InviteModal
          onClose={() => setShowInviteModal(false)}
          isOpen={showInviteModal} 
          document={currentDocument}
          client={client}
        />
      {
        currentDocument &&
        <Flex direction='row' justifyContent='flex-end' p={1} flexGrow={2} height='100%' >
          <Flex direction='row' >
            <Button
              onClick={() => setShowInviteModal(true)}
              size='md'
              p={5}
             >Invite</Button>

            <Button
              onClick={() => setShowFileEdit(true)}
              size='md'
              mx={'20px'}
              p={5}>Edit</Button>
          </Flex>       
        </Flex>
      }
    </Flex>
  )
}