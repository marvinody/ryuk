const fs = require('fs')

const stripJSONComments = (data) => {
  var re = new RegExp("\/\/(.*)", "g");
  return data.replace(re, '');
}

module.exports = (filePath) => {
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const stripped = stripJSONComments(jsonData);
  const jsonObject = JSON.parse(stripped);
  return jsonObject
}
