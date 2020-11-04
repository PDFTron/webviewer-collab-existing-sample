import { Box, Spinner } from '@chakra-ui/core';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import UserContext from '../context/user';
import { useLocation } from 'react-router-dom';

interface AuthProps {
  children: any;
}

export default function Auth({
  children
}: PropsWithChildren<AuthProps>) {

  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const get = async () => {
      const resp = await fetch('http://localhost:3000/api/session', {
        credentials: 'include'
      });
      if (resp.status === 200) {
        const json = await resp.json();
        setUser(json);
      }
      setLoading(false);
    }
    get();
  }, [location.pathname])

  return (
    <UserContext.Provider value={user}>
      {
        loading ?
          <Box>
            <Spinner></Spinner>
          </Box> :
          children
      }
    </UserContext.Provider>
  );
}
