// Check out the readme if need explanation on this folder/file...
require('dotenv').config()
const bestbuy = require('../bestbuy')
const discord = require('../discord')

const sku = "6430161";

(async () => {
  try {

    const result = await bestbuy({ sku });

    if (result.sku !== sku) {
      throw new Error(`SKU mismatch: Expected "${result.sku}" to equal "${sku}"`);
    }

    if (result.status !== "Sold Out") {
      throw new Error(`Status mismatch: Expected "${result.status}" to be "Sold Out"`)
    }
    await discord.webhook("SNAFU")
  } catch (err) {
    console.error(err)
    await discord.webhook(err.message)
  }
})()
