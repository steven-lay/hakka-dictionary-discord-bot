// @ts-check
const { parseHTML } = require("linkedom")

const placeNameMap = {
  梅縣: "梅縣 Meixian",
  博羅: "博羅 Boluo",
  大埔: "大埔 Dabu",
  豐順: "豐順 Fengshun",
  和平: "和平 Heping",
  賀州: "賀州 Hezhou",
  花都: "花都 Huadu",
  會昌: "會昌 Huichang",
  惠城: "惠城 Huicheng",
  惠陽: "惠陽 Huiyang",
  蕉嶺: "蕉嶺 Jiaoling",
  揭西: "揭西 Jiexi",
  陸川: "陸川 Luchuan",
  陸河: "陸河 Luhe",
  寧都: "寧都 Ningdu",
  上思: "上思 Shangsi",
  翁源: "翁源 Wenyuan",
  五華: "五華 Wuhua",
  興寧: "興寧 Xingning",
  英德: "英德 Yingde",
  永定: "永定 Yongding",
  詔安: "詔安 Zhaoan",
  紫金: "紫金 Zijin",
  綜合: "綜合 Mixed",
}

const superscriptToRegularMap = {
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
}

/**
 * Returns search results from Syndict.
 * @param {string} searchTerm The search term
 * @return {Promise<string[]>} Array of results
 */
async function getSyndictResults(searchTerm) {
  const response = await fetch(`https://www.syndict.com/w2p.php?word=${searchTerm}&item=hak`)
  const data = await response.text()

  const { document } = parseHTML(data)

  /* Return if no results found */
  if (!document.querySelectorAll(".tem_group").length) return ["No results found"]

  let results = []

  document.querySelectorAll(".tem_group").forEach((val) => {
    let pronunciationResult = ""

    /* Iterate through each pronunciation, fix formatting */
    val.querySelectorAll(".yinLi").forEach((entry) => {
      // @ts-ignore
      const tempLine = entry.textContent
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\u200B/g, "")
        .replace(/\p{Script=Han}+/gu, (match) => placeNameMap[match])

      pronunciationResult += `\n${tempLine}`
    })

    results.push(pronunciationResult)
  })

  return results
}

/**
 * Returns search results from Moedict.
 * @param {string} searchTerm The search term
 * @return {Promise<string[]>} Array of results
 */
async function getMoedictResults(searchTerm) {
  const response = await fetch(`https://www.moedict.tw/h/${searchTerm}.json`)

  if (!response.ok) return ["No results found"]

  const { h } = await response.json()

  const formattedResults = h.map(
    (entry) =>
      `${entry.p
        .replace(/四⃞/g, "\n四縣 Sixian: ")
        .replace(/海⃞/g, "\n海陸 Hailu: ")
        .replace(/大⃞/g, "\n大埔 Dabu: ")
        .replace(/平⃞/g, "\n饒平 Raoping: ")
        .replace(/安⃞/g, "\n詔安 Zhaoan: ")
        .replace(/南⃞/g, "\n南四縣 South Sixian: ")
        .replaceAll(/\p{No}/gu, (match) => superscriptToRegularMap[match])}\n`,
  )

  return formattedResults
}

module.exports = {
  getSyndictResults,
  getMoedictResults,
}
