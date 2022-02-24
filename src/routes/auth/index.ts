import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import jwt from 'jsonwebtoken';

import client from '../../graphql/client';

const JWT_EXPIRE_TIME = '7d';

const generateJWT = ({ allowedRoles, defaultRole, otherClaims }) => {
  const payload = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-allowed-roles': allowedRoles,
      'x-hasura-default-role': defaultRole,
      ...otherClaims,
    },
  };
  return jwt.sign(payload, process.env.HASURA_GRAPHQL_JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRE_TIME,
  });
};

const loginUser = gql`
  query FindUserByUsername($username: String) {
    users(where: { username: { _eq: $username } }) {
      id
      password
    }
  }
`;

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const response = await client.request(loginUser, { username });
    const dbUser = response.users?.[0];
    if (!dbUser) return res.status(403).json({ message: 'Usuário ou senha incorretos' });

    const validPassword = bcrypt.compareSync(password, dbUser.password);
    if (!validPassword) return res.status(403).json({ message: 'Usuário ou senha incorretos' });

    const accessToken = generateJWT({
      defaultRole: 'user',
      allowedRoles: ['user'],
      otherClaims: {
        'x-hasura-user-id': dbUser.id,
      },
    });
    return res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

const createUserQuery = gql`
  mutation CreateUserMutation($username: String, $password: String) {
    insert_users_one(object: { username: $username, password: $password }) {
      id
    }
  }
`;

export const signUpController = async (req: Request, res: Response) => {
  const { username, password, confirmPassword } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'usuário inválido' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Senha inválida' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'As senhas não são iguais' });
  }

  const hashPassword = bcrypt.hashSync(password);

  const variables = { username, password: hashPassword };

  try {
    const response = await client.request(createUserQuery, variables);
    const userId = response.insert_users_one?.id;

    const accessToken = generateJWT({
      defaultRole: 'user',
      allowedRoles: ['user'],
      otherClaims: {
        'x-hasura-user-id': userId,
      },
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    if (error.response.errors[0].message.includes('Uniqueness violation.')) {
      return res.status(409).json({ message: 'Usuário já existe' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
