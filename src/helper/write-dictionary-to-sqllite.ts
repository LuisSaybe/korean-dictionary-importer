import fs from "fs";
import readline from "readline";
import * as jsdom from "jsdom";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

import { removeWhiteSpaceFromXML } from "src/helper/xml";
import {
  insertEntry,
  insertSenses,
  createTables,
  insertExampleInfo,
} from "src/helper/sqllite";

export const writeToSQLLite = async (inputFile: string, filename: string) => {
  const db = await open({
    filename,
    driver: sqlite3.Database,
  });

  await createTables(db);

  const dom = new jsdom.JSDOM();
  const domParser = new dom.window.DOMParser();
  const serializer = new dom.window.XMLSerializer();
  const lines = readline.createInterface({
    input: fs.createReadStream(inputFile),
  });
  let index = 0;

  for await (const line of lines) {
    const modifiedXML = removeWhiteSpaceFromXML(line);
    const xml = serializer.serializeToString(modifiedXML.documentElement);
    const doc = domParser.parseFromString(xml, "application/xml");

    await Promise.all([
      insertEntry(db, doc),
      insertSenses(db, doc),
      insertExampleInfo(db, doc),
    ]);

    if (index % 100 === 0) {
      console.log("Writing SQLLite entry", index);
    }

    index++;
  }

  db.close();
};
