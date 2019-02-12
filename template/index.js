const fs = require('fs')
const path = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const readdir = util.promisify(fs.readdir)

const mustache = require('mustache')
const marked = require('marked')

async function findSolidityFiles(dir) {
  const files = await readdir(dir)

  return files.filter(file => file.split(".").pop() == "sol")
}

function removeExt(fileName) {
  return fileName.split(".").slice(0, -1).join("")
}

// convert index.md.mustache -> index.html.js
async function main() {
  const args = process.argv.slice(2)
  const dir = args[0] || '.'

  const solidityFileNames = await findSolidityFiles(dir)

  let codes = {}
  for (let fileName of solidityFileNames) {
    codes[removeExt(fileName)] = (await readFile(path.join(dir, fileName))).toString()
  }

  const mdTemplate = (await readFile(path.join(dir, 'index.md.mustache'))).toString()

  const markdown = mustache.render(mdTemplate, codes)
  const html = marked(markdown).replace(/&quot;/g, `"`)

  const jsTemplate = (await readFile(path.join(__dirname, './index.html.js.mustache'))).toString()
  const js = mustache.render(jsTemplate, { html })

  console.log(js)
}

main()
