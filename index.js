import axios from 'axios'
const fs = require('fs-extra')
const cheerio = require('cheerio')
const csv = require('csvtojson')

let getLinksFromHtml = (html) => {
  let r = /https:\/\/(.*)\.pdf/g
  let a = html.match(r)
  return a
}

let getLinksFromUrl = async (url, page = 0, linksList = []) => {
  axios(url)
  .then(async(html) => {
    let r = /https:\/\/(.*)\.pdf/g
    let links = html.data.match(r)
    if (links !== null) {
      linksList = linksList.concat(links)
      page = page + 1
      console.log(url.split('?')[0] + '?page=' + page, page)
      getLinksFromUrl(url.split('?')[0] + '?page=' + page, page, linksList)
    } else {
      console.log(linksList)
      linksList.map(url => {
        let filename = url.split('/')
        downloadFile(url, 'pdfs', filename[filename.length - 1])
      })
    }
  })
  .catch(e => console.log(e))
}

let downloadFile = (url, folder, filename) => {
  return axios.request({
    responseType: 'arraybuffer',
    url,
    method: 'get',
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
  .then((result) => {
    fs.ensureDir(folder)
    .then(() => {
      const outputFilename = `./${folder}/${filename}`
      fs.writeFileSync(outputFilename, result.data)
      return outputFilename
    })
    .catch(e => console.log(e))
  })
  .catch(e => console.log(e))
}

getLinksFromUrl('https://unama.unmissions.org/srsg-briefings-security-council')
