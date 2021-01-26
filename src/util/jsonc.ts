import fs from 'fs';

const stripJSONComments = (data: string) => {
  const re = new RegExp('//(.*)', 'g');
  return data.replace(re, '');
};

export default (filePath: string) => {
  const jsonData = fs.readFileSync(filePath, 'utf8');
  // const stripped = stripJSONComments(jsonData);
  const jsonObject = JSON.parse(jsonData);
  return jsonObject;
};
