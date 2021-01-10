const { curly } = require('node-libcurl');

const objectToStringArray = obj => Object.entries(obj).map(([key, value]) => `${key}: ${value}`)


module.exports = {
  get: async (url, { headers: reqHeaders = {}, followRedirects = true }) => {
    const { data, statusCode, headers } = await curly.get(url, {
      FOLLOWLOCATION: followRedirects,
      httpHeader: objectToStringArray(reqHeaders),
    })
    return {
      data, statusCode, headers
    }
  }
}
