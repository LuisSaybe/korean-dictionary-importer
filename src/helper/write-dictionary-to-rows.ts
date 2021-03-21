import AdmZip from "adm-zip";
import { open, close, appendFile } from "fs";
import * as jsdom from "jsdom";

import { getDefinition } from "src/helper/dictionary-api";
import { removeWhiteSpaceFromXML } from "src/helper/xml";

async function writeLines(
  fileDescriptor: number,
  inputXMLZipfile: string,
  apiKey: string,
) {
  const zip = new AdmZip(inputXMLZipfile);
  const zipEntries = zip.getEntries();
  const newLinesRegex = new RegExp("\n", "g");
  const visited = new Set();
  let first = true;

  for (
    let zipEntriesIndex = 0;
    zipEntriesIndex < zipEntries.length;
    zipEntriesIndex++
  ) {
    const idRegex = new RegExp(
      '<LexicalEntry\\s+att="id"\\s+val="(\\d+)">',
      "g",
    );
    const dom = new jsdom.JSDOM();
    const serializer = new dom.window.XMLSerializer();
    const data = zipEntries[zipEntriesIndex].getData().toString("utf8");
    let match;

    while ((match = idRegex.exec(data))) {
      const id = match[1];

      if (visited.has(id)) {
        continue;
      }

      visited.add(id);

      let xmlString;
      let content;

      try {
        xmlString = await getDefinition(id, apiKey);
        console.log(
          `Fetched ${id} from zipentry ${zipEntriesIndex} / ${zipEntries.length}`,
        );
      } catch (e) {
        console.error(e);
      }

      if (xmlString) {
        const documentWithoutWhitespace = removeWhiteSpaceFromXML(
          xmlString.trim(),
        );
        content = serializer
          .serializeToString(documentWithoutWhitespace)
          .replaceAll(newLinesRegex, "");
      } else {
        content = id;
      }

      const toWrite = first ? content : "\n" + content;

      await new Promise<void>((resolve, reject) =>
        appendFile(fileDescriptor, toWrite, "utf8", (e) => {
          if (e) {
            reject(e);
          } else {
            resolve();
          }
        }),
      );

      first = false;
    }
  }
}

export async function writeToLines(
  inputXMLZipfile: string,
  outputFile: string,
  apiKey: string,
) {
  return new Promise<void>((resolve, reject) => {
    open(outputFile, "a", async (e, fd) => {
      if (e) {
        reject(e);
        return;
      }

      await writeLines(fd, inputXMLZipfile, apiKey);

      close(fd, (e) => {
        if (e) {
          reject(e);
        } else {
          resolve();
        }
      });
    });
  });
}

// 68877
