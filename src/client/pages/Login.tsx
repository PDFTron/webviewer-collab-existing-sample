import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, Text } from '@chakra-ui/core';
import React, { PropsWithChildren, useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import Link from '../components/Link';
import UserContext from '../context/user';

interface LoginProps {
  //
}

export default function Login(props: PropsWithChildren<LoginProps>) {
  
  const { handleSubmit, register, formState } = useForm();
  const [ error, setError ] = useState<string>();
  const history = useHistory();
  const user = useContext(UserContext);

  const onSubmit = async (values) => {

    const body = JSON.stringify({
      email: values.email,
      password: values.password
    });

    try {
      const resp = await fetch('http://localhost:3000/api/login', {
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
        setError('Invalid username or password')
      }
    } catch (e) {
      setError('Invalid username or password')
    }
  }

  useEffect(() => {
    if (user) {
      history.push('/')
    }
  }, [user])

  return (
    <Flex alignItems='center' justifyContent='center' height='100%'>
      <Box width='400px' bg='gray.50' padding='20px' borderRadius='4px'>
        <Heading textAlign='center'>Login</Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type='text' name='email' ref={register()} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type='password' name='password' ref={register()} />
          </FormControl>

          <FormErrorMessage>
            {error}
          </FormErrorMessage>

          <Text color='red.500'>{error}</Text>
          
          <Button marginTop='20px' type='submit' isLoading={formState.isSubmitting}>Submit</Button>
        </form>
        

        <Link to='/sign-up'>
          <Text textAlign='center'>
            Don't have an account?
          </Text>
        </Link>
      </Box>

    </Flex>
  );
}
