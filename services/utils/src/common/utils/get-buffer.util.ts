import DataUriParser from 'datauri/parser.js';
import * as path from 'path';

export interface FormattedDataUri {
  fileName?: string;
  mimetype?: string;
  content?: string;
  base64?: string;
  buffer?: Buffer;
}

/**
 * Converts a Multer file to DataURI format
 */
export const getBuffer = (file: Express.Multer.File): FormattedDataUri => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export default getBuffer;
