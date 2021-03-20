import AdmZip from "adm-zip";
import fs from "fs";
import * as jsdom from "jsdom";
const csvWriter = require("csv-writer");

import { getDefinition } from "src/helper/dictionary-api";
import { removeWhiteSpaceFromXML } from "src/helper/xml";

export const writeToCSV = async (
  inputXMLZipfile: string,
  outputFile: string,
  apiKey: string,
) => {
  const zip = new AdmZip(inputXMLZipfile);
  const zipEntries = zip.getEntries();
  const options = {
    path: outputFile,
    header: [{ id: "entry", title: "entry" }],
  };
  fs.writeFileSync(outputFile, "entry\n");
  const writer = csvWriter.createObjectCsvWriter({ ...options, append: true });
  const dom = new jsdom.JSDOM();
  const domParser = new dom.window.DOMParser();
  const serializer = new dom.window.XMLSerializer();

  for (
    let zipEntriesIndex = 0;
    zipEntriesIndex < zipEntries.length;
    zipEntriesIndex++
  ) {
    const doc = domParser.parseFromString(
      zipEntries[zipEntriesIndex].getData().toString("utf8"),
      "application/xml",
    );
    const result = doc.evaluate(
      "//feat[@att='lexicalUnit'][@val='단어']/parent::LexicalEntry/@val",
      doc,
      null,
      dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null,
    );
    let attribute = result.iterateNext();

    while (attribute) {
      const xmlString = await getDefinition(attribute.value, apiKey);
      const documentWithoutWhitespace = removeWhiteSpaceFromXML(
        xmlString.trim(),
      );
      const xml = serializer.serializeToString(documentWithoutWhitespace);

      writer.writeRecords([{ entry: xml }]);
      console.log(
        `Processing zip file ${zipEntriesIndex} / ${zipEntries.length}, wrote entry with ID ${attribute.value}`,
      );
      attribute = result.iterateNext();
    }
  }

  console.log("Completed processing API Data");
};
