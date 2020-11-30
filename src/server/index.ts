import { getToken, decodeToken, SerializedUser } from './auth';
import express from 'express';
import DB, { User, UserTypes } from './db';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { generateResolvers } from './resolvers';
import CollabServer, { UserAuth } from '@pdftron/collab-server';
import { writeFile } from './files';
export { UserAuth };

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const db = new DB();
const corsOption = {
  origin: 'http://localhost:1234',
  credentials: true
};

const resolvers = generateResolvers(db);

const server = new CollabServer({
  resolvers,
  corsOption,
  getUserFromToken: decodeToken
});

server.start(8000);

const app = express();
app.use(express.json());
app.use(cors(corsOption));
app.use(cookieParser())

app.use('/files', express.static(path.resolve(__dirname, '../../data/files')));

/**
 * An endpoint for creating new users.
 * We do not do any password hashing here just to keep things simple.
 * 
 * We also write a 'session' cookie on success
 */
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  //overwrite user if user with the email already exists(in case of invited by other users)
  db.write((data, getId) => {
    const newUser: User = {
      id: getId(),
      email,
      password,
      type: UserTypes.STANDARD 
    };
    let id = newUser.id;
    const userIndex = data.users.findIndex(user => user.email === email);
    if(userIndex !== -1) {
      const user = data.users[userIndex];
      data.users[userIndex] = {
        ...user,
        password,
        type: UserTypes.STANDARD
      }
      id = user.id;
    } else {
      data.users.push(newUser);
    }
    res.cookie('session', getToken({ id, email }));
    res.status(200).send({ success: true });

    return data;
  })
})

/**
 * An endpoint for logging in a user.
 * Returns 401 if credentials are invalid,
 * otherwise returns 200 success.
 * 
 * We do not do any password hashing here.
 */
app.post('/api/login', (req, res) => {

  const { email, password } = req.body;

  const user = db.query((data) => {
    return data.users.find(user => user.email === email && user.password === password);
  });

  if (!user) {
    return res.status(401).send();
  }

  /**
   * Pick everything except 'password' from the user object,
   * as we dont want to send the password to the client
   */
  const {
    password: _,
    ...rest
  } = user;

  res.cookie('session', getToken({ id: user.id, email: user.email }));

  return res.status(200).send(rest);
});

const authMiddleware = (req, res, next) => {
  const cookie = req.cookies['session'];
  if (!cookie) {
    return res.status(401).send();
  }

  try {
    const decoded = decodeToken(cookie);
    req.user = decoded;
  } catch (e) {
    
  }

  next();
}

/**
 * An endpoint to decode a users session, if it exists
 */
app.get('/api/session', authMiddleware, (req, res) => {
  const user = req.user;
  const token = req.cookies['session'];
  return res.status(200).send({
    user,
    token
  });
})

/**
 * Get all documents for a user
 */
app.get('/api/documents', authMiddleware, (req, res) => {
  const user = req.user;

  const documents = db.query((data) => {
    //documents exist in db before integration
    const existingDocs = data.documents.filter(d => d.userId === user.id);
    let collabDocs = [];
    const members = data.documentMembers?.filter(documentMember => documentMember.userId === user.id);
    if(members) {
      const docs = members.map(member => data.documents?.find(document => document.id === member.documentId));
      collabDocs = docs.filter( doc => doc.userId !== user.id);
    } 
    return [...existingDocs, ...collabDocs];
  });
  return res.status(200).send({ documents })
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

    const document = {
      userId: user.id,
      id: docId,
      name,
      url
    };
    data.documents.push(document);

    res.status(200).send(document);
    return data;
  })
})

app.listen(3000, () => {
  console.log('Server listening on port 3000!');
})


// Extend express Request object to have the user
declare module 'express-serve-static-core' {
  interface Request {
    user?: SerializedUser
  }
}