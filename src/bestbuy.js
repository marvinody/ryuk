const Xray = require('x-ray')
const axios = require('axios').default
const _ = require('lodash')
const logger = require('./logger')
const minWait = require('./minWait')

const DELAY_BETWEEN_LOOKUPS_IN_MS = 5000

const x = Xray()

const options = {
  headers: {
    common: {

      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "DNT": "1",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "max-age=0",
      "TE": "Trailers",
      "Cookie": "UID=47bebf67-c772-4624-8f0e-bda45291b838; pst2=478|N; physical_dma=501; customerZipCode=11377|N; oid=1773878008; vt=cf38a210-5184-11eb-83dd-12e56de9e2ab; _abck=5D35BD88BD3E4F258E4EDA66C9497F27~-1~YAAQNJUzuARwCJ12AQAAH7zw4AV/YEGreArubYLddaXbmCDGm3L03S2KldWuog8H4TxilxrTags9EkPlVPyytduo56cORVtUYj6CS+iwtecR6NmJH9BE1jTbYk4BxdEAN9vElBBouCkxW5zddQMeH0+8ai9w2ZZ6P+5XVcqs2FQ13LmQavd5YkXA33eDnTYwLtqJaKSZvxU/ke1dfHAU+W2opXGXpNYPo6SR0Z8YbxNj+ctz7uRtOmN9CRFJRaFWdFE6Dr9cncrUwmb6YyG99B5rv9YtyEu/V+kGxx5Ywv75RPQ74MB+gSZXfw==~-1~-1~-1; bm_sz=A274554B2CCE0C567ED11ED249675B89~YAAQNJUzuANwCJ12AQAAH7zw4ApJc4DowmOzZ3mWS2b2qSpl9RnvT/tSlN59feV6ggCZUjgCXXkExCBfRsDnNMgS9NC0dujkkarbmnPVnNtpw6EvOFCG34xB7m8mVYljpMqByI/vrHmEOLusktwv1NzGjJMm2nSTvbWtCnKcG4SchEkq+7HqaA14gJW975yLog==; bby_rdp=l; CTT=6ee4138fb450441cfafbffc5b13a0241; SID=5b2ce497-14ec-447e-b918-7b00fffe8416"
    }
  }
}
const makeDriver = ({ headers }) => {
  d = axios.create({
    headers,
    withCredentials: true,
    validateStatus: status => status < 400 && status >= 200
  })

  d.interceptors.request.use(x => {
    logger.debug("axios headers" + JSON.stringify(x, null, 2))
    return x;
  })

  return async (ctx, cb) => {
    logger.debug(`Going to ${ctx.url}`)
    const { data } = await d.get(ctx.url)
    ctx.body = data
    cb(null, data)
  }
}

const driver = makeDriver(options)

x.driver(driver)

const makeUrl = ({ sku }) => {
  const template = "https://www.bestbuy.com/site/bestbuy-is-ass/{{sku}}.p"

  return template
    .replace(/\{\{sku\}\}/g, sku)
}


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
