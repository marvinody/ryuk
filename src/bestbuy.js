const Xray = require('x-ray')
const makeDriver = require('request-x-ray')
const _ = require('lodash')
const logger = require('./logger')
const minWait = require('./minWait')

const DELAY_BETWEEN_LOOKUPS_IN_MS = 5000

const x = Xray()

const options = {
  method: "GET", 						//Set HTTP method
  jar: true, 							//Enable cookies
  headers: {							//Set headers
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
    "TE": "Trailers",
  }
}

const driver = makeDriver(options)

x.driver(driver)

const makeUrl = ({ sku }) => {
  const template = "https://www.bestbuy.com/site/bestbuy-is-ass/{{sku}}.p"

  return template
    .replace(/\{\{sku\}\}/g, sku)
}


// x('', '').then((value) => {
//   console.log({ value })
//   a.a.aa
// })

const ADD_TO_CART_SELECTOR = '.fulfillment-add-to-cart-button button'

const search = ({ sku }) => {
  logger.info(`${sku}: Searching`)
  // have to wrap in promise because xray isn't a promise...it's promise-like... with just a .then
  return new Promise((res, rej) => {
    const url = makeUrl({ sku })
    x(url, ADD_TO_CART_SELECTOR).then(value => {
      logger.info(`${sku}: status=${value}`)
      res({
        sku,
        status: value,
        url,
      })
    })
  })
}


module.exports = minWait(search, DELAY_BETWEEN_LOOKUPS_IN_MS)
