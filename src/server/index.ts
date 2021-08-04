import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import CollabServer, { UserAuth } from '@pdftron/collab-server';
import { generateResolvers } from './resolvers';
import { getHash, getUserFromToken, comparePassword } from './auth';
import DB, { User, UserStatus, UserTypes, Document, DatabaseShape } from './db';
import { writeFile } from './files';
export { UserAuth };
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = new DB();
const corsOption = {
  origin: 'http://localhost:1234',
  credentials: true
};

const resolvers = generateResolvers(db);

const server = new CollabServer({
  resolvers,
  corsOption,
  getUserFromToken,
  getNow: () => Date.now()
});

server.start(8000);

const app = express();
app.use(express.json());
app.use(cors(corsOption));
app.use(cookieParser());

app.use('/files', express.static(path.resolve(__dirname, '../../data/files')));

/**
 * An endpoint for creating new users.
 *
 * We also write a 'session' cookie on success
 */
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const passwordHash = await getHash(password);

  // overwrite user if user with the email already exists(in case of invited by other users)
  db.write((data, getId) =>  {
    let newUser: User;
    const userIndex = data.users.findIndex((user) => user.email === email);
    // user already exist
    if (userIndex !== -1) {
      if (data.users[userIndex].type !== 'ANONYMOUS') {
        res.status(401).send({
          error: 'User already exists'
        });
        return data;
      }

      const user = data.users[userIndex];
      newUser = {
        ...user,
        password,
        type: UserTypes.STANDARD
      };
      data.users[userIndex] = newUser;
    } else {
      newUser = {
        id: getId(),
        userName: email,
        email,
        password: passwordHash,
        type: UserTypes.STANDARD,
        status: UserStatus.ACTIVE,
        customData: null,
        updatedAt: Date.now(),
        createdAt: Date.now()
      }
      data.users.push(newUser);
    }
    if (newUser) {
      const token = jwt.sign({
        id: newUser.id,
        email
      }, process.env.COLLAB_KEY);

      res.cookie('wv-collab-token', token);
      res.status(200).send({
        user: newUser,
        token
      })
    } else {
      res.status(400).send();
    }
    return data;
  });

});

app.post('/api/logout', async (req, res) => {
  res.clearCookie('wv-collab-token').send();
});

/**
 * An endpoint for logging in a user.
 * Returns 401 if credentials are invalid,
 * otherwise returns 200 success.
 *
 * We do not do any password hashing here.
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = db.query((data) => {
    return data.users.find((user) => user.email === email && user.password === password);
  });

  if (!user) {
    return res.clearCookie('wv-collab-token').status(401).send();
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    res.clearCookie('wv-collab-token').status(401).send();
    return;
  }

  /**
   * Pick everything except 'password' from the user object,
   * as we dont want to send the password to the client
   */
  const { password: _, ...rest } = user;


  const token = jwt.sign({
    id: user.id,
    email
  }, process.env.COLLAB_KEY);

  res.cookie('wv-collab-token', token);

  return res.status(200).send(rest);
});

const authMiddleware = async (req, res, next) => {
  const token = req.cookies['wv-collab-token'];
  if (!token) {
    return res.status(401).send();
  }

  try {
    const decoded = await getUserFromToken(token);
    req.user = decoded;
  } catch (e) {}

  next();
};

/**
 * An endpoint to decode a users session, if it exists
 */
app.get('/api/session', authMiddleware, (req, res) => {
  const user = req.user;
  const token = req.cookies['wv-collab-token'];
  return res.status(200).send({
    user,
    token
  });
});

/**
 * Get all documents for a user
 */
app.get('/api/documents', authMiddleware, (req, res) => {
  const user = req.user;

  const documents = db.query((data) => {
    //documents exist in db before integration
    const existingDocs = data.documents.filter((d) => d.authorId === user.id);
    let collabDocs = [];
    const members = data.documentMembers?.filter(
      (documentMember) => documentMember.userId === user.id
    );
    if (members) {
      const docs = members.map((member) =>
        data.documents?.find((document) => document.id === member.documentId)
      );
      collabDocs = docs.filter((doc) => doc.authorId !== user.id);
    }
    return [...existingDocs, ...collabDocs];
  });
  return res.status(200).send({ documents });
});

/**
 * Endpoint to make a new document
 */
app.post('/api/documents', [authMiddleware, upload.single('file')], (req, res) => {
  const user = req.user;

  const { body, file } = req;
  const { name } = body;

  db.write(async (data, getId) => {
    const docId = getId();
    const ext = name.split('.').pop();
    const newName = `${docId}.${ext}`;

    const url = await writeFile(newName, file);
    const document: Document = {
      id: docId,
      authorId: user.id,
      isPublic: false,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      name,
      url
    };

    res.status(200).send(document);
    return data;
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000!');
});

// Extend express Request object to have the user
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}
