import { Box, Button, Flex, Heading, Text, useDisclosure } from '@chakra-ui/core';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import useData from '../hooks/useData';
import type { Document } from '../../server/db';
import UploadModal from '../components/UploadModal';
import { useHistory, useParams } from 'react-router-dom';
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer';
import CollabClient from '@pdftron/collab-client';
import TopNav from '../components/TopNav';
import ClientContext from '../context/client';
import UserContext from '../context/user';

export default function View() {

  const user = useContext(UserContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();
  const { id } = useParams<any>();
  const [instance, setInstance] = useState<WebViewerInstance>();
  const [activeFile, setActiveFile] = useState<Document>();
  const client: CollabClient = useContext(ClientContext);

  const {
    data: documents = [],
    refresh: refreshDocuments,
  } = useData<Document[]>({
    url: 'http://localhost:3000/api/documents',
    key: 'documents'
  })

  useEffect(() => {
    if(!user) {
      history.push('/login');
    }
  },[user]);

  useEffect(() => {
    const ele = document.getElementById('viewer');
    WebViewer({
      path: '/public/webviewer'
    }, ele).then( async instance => {
      client.setInstance(instance);
      instance.UI.openElements(['notesPanel']);
      setInstance(instance);
      client.subscribe('documentChanged', () => {
        refreshDocuments();
      })
    })
  }, []);

  useEffect(() => {
    const go = async () => {
      if (id && instance) {
        const file = documents.find(doc => doc.id === id);
        if (file && activeFile?.id !== file.id) {
          setActiveFile(file);
          await client.loadDocument(`http://localhost:3000${file.url}`, {
            documentId: file.id,
            filename: file.name
          });
        }
      }
    };
    go();
  }, [id, instance, documents, activeFile])

  const selectDocument = useCallback((doc: Document) => {
    history.push(`/${doc.id}`);
  }, [])

  return (
    <Flex height='100%'>
      <UploadModal
        onComplete={(document) => {
          refreshDocuments();
          selectDocument(document);
        }}
        client={client}
        onClose={onClose}
        isOpen={isOpen}
      />

      <Flex width='200px' bg='gray.300' height='100%' direction='column' padding='20px 10px'>
        <Box>
          <Heading size='sm'>My documents</Heading>
          {
            documents?.map(doc => {
              const selected = doc.id === id;
              return (
                <Button variant="solid" variantColor={selected ? 'teal' : undefined} width='100%' key={doc.id} onClick={() => selectDocument(doc)} padding='5px' borderRadius='2px' marginTop='10px'>
                  <Text>{doc.name}</Text>
                </Button>
              )
            })
          }
        </Box>
        <Box marginTop='auto' textAlign='center'>
          <Button width='100%' marginBottom='10px' onClick={onOpen}>
            New Document
          </Button>
          <Text>{user?.email}</Text>
        </Box>
      </Flex>

      <Box flexGrow={1} height='100%'>
        <TopNav
          client={client}
          currentDocument={activeFile}
        />
        <Box id='viewer'></Box>
      </Box>
    </Flex>
  );
}
