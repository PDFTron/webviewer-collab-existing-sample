import fs from 'fs-extra'
import path from 'path';

const fileStore = path.resolve(__dirname, '../../data/files');

export const writeFile = async (name: string, file: any) => {

  fs.ensureDirSync(fileStore);

  const writeTo = path.join(fileStore, `./${name}`);
  const buff = file.buffer;

  fs.writeFileSync(writeTo, buff);
  return `/files/${name}`;
}