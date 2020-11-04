/**
 * A file containing basic utilities for JWT authentication
 */

import jwt from 'jsonwebtoken';

const PRIVATE_KEY = 'abcdef'

export type SerializedUser = {
  id: string;
  email: string;
}

export const getToken = (user: SerializedUser) => {
  return jwt.sign(user, PRIVATE_KEY);
}

export const decodeToken = (token: string): SerializedUser => {
  return jwt.verify(token, PRIVATE_KEY) as SerializedUser;
}