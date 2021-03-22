import AdmZip from "adm-zip";
import { open, close, appendFile } from "fs";
import * as jsdom from "jsdom";

import { getDefinition } from "src/helper/dictionary-api";
import { removeWhiteSpaceFromXML } from "src/helper/xml";

function stringMatchesToArray(data: string) {
  const regex = new RegExp('<LexicalEntry\\s+att="id"\\s+val="(\\d+)">', "g");
  const result = [];
  let match;

  while ((match = regex.exec(data))) {
    result.push(match[1]);
  }

  return result;
}

async function writeLines(
  fileDescriptor: number,
  inputXMLZipfile: string,
  apiKey: string,
) {
  const zip = new AdmZip(inputXMLZipfile);
  const zipEntries = zip.getEntries();
  const newLinesRegex = new RegExp("\n", "g");
  const dom = new jsdom.JSDOM();
  const serializer = new dom.window.XMLSerializer();
  const ids: string[] = zipEntries
    .map((entry) => stringMatchesToArray(entry.getData().toString("utf8")))
    .flat();
  const queue = Array.from(new Set(ids));
  let first = true;

  while (queue.length > 0) {
    const id = queue.pop();

    let xmlString;

    try {
      xmlString = await getDefinition(id, apiKey);
    } catch (e) {
      queue.push(id);
      continue;
    }

    const content = serializer
      .serializeToString(removeWhiteSpaceFromXML(xmlString.trim()))
      .replaceAll(newLinesRegex, "");
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
    console.log(`Wrote ${id}. Queue length ${queue.length}`);
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
