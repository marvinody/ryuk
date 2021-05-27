import fs from 'fs';

const stripJSONComments = (data: string) => {
  const re = new RegExp('^\\s+//(.*)', 'g');
  return data.replace(re, '');
};

export default (filePath: string) => {
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const stripped = stripJSONComments(jsonData);
  console.log(stripped);
  const jsonObject = JSON.parse(stripped);
  return jsonObject;
};
