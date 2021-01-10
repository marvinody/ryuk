const path = require('path')
const fs = require('fs')

const logger = require('../logger')
const cleanup = require('../cleanup')

const DB_FILENAME = "shitty_db.json"

const DB_FILEPATH = path.join(__dirname, '..', '..', DB_FILENAME)

const emptyData = {};

const writeData = d => fs.writeFileSync(
  DB_FILEPATH,
  JSON.stringify(d, null, 2),
  {
    encoding: 'utf-8',
  }
)

let dirty = false;
const data = (() => {
  if (fs.existsSync(DB_FILEPATH)) {
    logger.info(`Reading DB: ${DB_FILEPATH}`)
    const rawString = fs.readFileSync(DB_FILEPATH)
    return JSON.parse(rawString)
  } else {
    writeData(emptyData)
    logger.info(`Creating DB: ${DB_FILEPATH}`)
    return emptyData
  }
})();

// returns array of [created, rowAsObject]
const findOrCreate = (id, defaults) => {
  if (data[id]) {
    return [false, data[id]]
  }
  data[id] = defaults
  dirty = true
  return [true, defaults]
}

// updates (merges) passed in props to an object at certain id
const updateById = (id, newProps) => {
  data[id] = {
    ...data[id],
    ...newProps
  }
  dirty = true
  return data[id]
}

const flush = () => {
  if (dirty) {
    writeData(data)
    dirty = false
    logger.info("Writing data")
  }
}

// Add a cleanup handler to just write data if necessary
cleanup(flush)

module.exports = {
  findOrCreate,
  updateById,
  flush,
}
