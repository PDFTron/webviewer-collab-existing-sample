import fs from 'fs-extra';
import path from 'path';
import { v4 } from 'uuid';

/**
 * This file contains an in memory representation of a database driver.
 * For this example, we are just using a JSON files as our database.
 * In a real world scenerio, this would probably be a SQL driver
 * or something similar.
 */

export type User = {
  id: string;
  email: string;
  password: string;
}

export type Document = {
  id: string;
  name: string;
  userId: string;
  url: string
}

type DatabaseShape = {
  users: User[];
  documents: Document[]
}

const dataLocation = path.resolve(__dirname, '../../data/database.json');

const getId = () => v4();


/**
 * A fake database driver for getting and settings items in memory.
 */
export default class DB {

  db: DatabaseShape;

  constructor() {
    if (fs.existsSync(dataLocation)) {
      const rawData = fs.readFileSync(dataLocation) + '';
      this.db = JSON.parse(rawData);
    } else {
      this.db = { users: [], documents: [] };
      this.writeToFile();
    }
  }

  private writeToFile() {
    fs.ensureDirSync(path.dirname(dataLocation));
    fs.writeFileSync(dataLocation, JSON.stringify(this.db, null, 2));
  }

  /**
   * Allows user to make a query on the database.
   * Is provided a frozen object so no writes can be made
   */
  query(callback: (db: Readonly<DatabaseShape>) => any) {
    const frozen = Object.freeze({ ...this.db });
    return callback(frozen)
  }

  /**
   * Allows user to write to the database.
   * Whatever is returned from the callback is written to file
   */
  async write(callback: (db: DatabaseShape, getId: () => string) => DatabaseShape|Promise<DatabaseShape>) {
    const clone = { ...this.db };
    const result = await callback(clone, getId);
    this.db = result;
    this.writeToFile();
  }
}