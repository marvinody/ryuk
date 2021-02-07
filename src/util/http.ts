const {curly} = require('node-libcurl');

const objectToStringArray = (obj: Object) =>
  Object.entries(obj).map(([key, value]) => `${key}: ${value}`);

export const get = async (
  url: string,
  {headers: reqHeaders = {}, followRedirects = true}
) => {
  const {data, statusCode, headers} = await curly.get(url, {
    FOLLOWLOCATION: followRedirects,
    httpHeader: objectToStringArray(reqHeaders),
  });
  return {
    data,
    statusCode,
    headers,
  };
};

export const post = async (
  url: string,
  {headers: reqHeaders = {}, followRedirects = true, data: postData = {}}
) => {
  const {data, statusCode, headers} = await curly.post(url, {
    postFields: JSON.stringify(postData),
    FOLLOWLOCATION: followRedirects,
    httpHeader: objectToStringArray(reqHeaders),
  });
  return {
    data,
    statusCode,
    headers,
  };
};
