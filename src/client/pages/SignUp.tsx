import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, Text } from '@chakra-ui/core';
import React, { PropsWithChildren, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import Link from '../components/Link';


export default function SignUp() {
  
  const { handleSubmit, register, formState } = useForm();
  const [error, setError] = useState<string>();

  const history = useHistory();

  const onSubmit = async (values) => {

    const { password, password2 } = values;
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }

    const body = JSON.stringify({
      email: values.email,
      password: values.password,
    });

    try {
      const resp = await fetch('http://localhost:3000/api/signup', {
        method: 'post',
        body,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (resp.status === 200) {
        history.push('/')
      } else {
        setError('An error occured')
      }
    } catch (e) {
      setError('An error occured')
    }
  }

  return (
    <Flex alignItems='center' justifyContent='center' height='100%'>
      <Box width='400px' bg='gray.50' padding='20px' borderRadius='4px'>
        <Heading textAlign='center'>Sign up</Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type='text' name='email' ref={register()} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type='password' name='password' ref={register()} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input type='password' name='password2' ref={register()} />
          </FormControl>

          <FormErrorMessage>
            {error}
          </FormErrorMessage>

          <Text color='red.500'>{error}</Text>
          
          <Button marginTop='20px' type='submit' isLoading={formState.isSubmitting}>Submit</Button>
        </form>
        

        <Link to='/login'>
          <Text textAlign='center'>
            Have an account?
          </Text>
        </Link>
      </Box>

    </Flex>
  );
}
