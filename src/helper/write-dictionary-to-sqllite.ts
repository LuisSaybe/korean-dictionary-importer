import fs from "fs";
import * as jsdom from "jsdom";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import csvParser from "csv-parser";

import { removeWhiteSpaceFromXML } from "src/helper/xml";
import {
  insertEntry,
  insertSenses,
  createTables,
  insertExampleInfo,
} from "src/helper/sqllite";

export const writeToSQLLite = async (csvInput: string, filename: string) => {
  const db = await open({
    filename,
    driver: sqlite3.Database,
  });

  await createTables(db);

  const dom = new jsdom.JSDOM();
  const domParser = new dom.window.DOMParser();
  const serializer = new dom.window.XMLSerializer();

  let index = 0;
  const promises = [];

  fs.createReadStream(csvInput)
    .pipe(csvParser())
    .on("data", (data) => {
      const modifiedXML = removeWhiteSpaceFromXML(data.entry);
      const xml = serializer.serializeToString(modifiedXML.documentElement);
      const doc = domParser.parseFromString(xml, "application/xml");

      promises.push(
        Promise.all([
          insertEntry(db, doc),
          insertSenses(db, doc),
          insertExampleInfo(db, doc),
        ]),
      );

      index++;

      if (index % 100 === 0) {
        console.log("Writing SQLLite entry", index);
      }
    })
    .on("end", () => {
      Promise.all(promises).finally(() => {
        console.log("Finished importing sqllite database");
        db.close();
      });
    });
};
