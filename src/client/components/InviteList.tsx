import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box,
  FormControl,
  Input,
  Button,
  FormLabel
} from '@chakra-ui/core';
import { useForm } from 'react-hook-form';

export default function InviteList({
  onSubmit
}) {
  const { handleSubmit } = useForm();
  const invitedRef = useRef(null);
  const [invited, setInvited] = useState([]);

  useEffect(() => {
    invitedRef.current.focus();
  }, []);
  
  const submit = useCallback(() => {
    const { value } = invitedRef.current;
    onSubmit(value);
  }, [onSubmit, invited])

  return (
    <Box>
      <form onSubmit={handleSubmit(submit)}>
        <FormControl>
          <FormLabel htmlFor='add-user' margin={2}> Email</FormLabel> 
          <Input id='add-user' ref={invitedRef} placeholder='email@address.com' />
        </FormControl>
      <Button type='submit' marginTop={3} width={'100%'} > Go </Button>
    </form>
    </Box>
    
  )
}  