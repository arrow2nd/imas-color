import * as vscode from 'vscode'
import axios from 'axios'

export const insertIdolColor = vscode.commands.registerTextEditorCommand(
  'imas-color.insertIdolColor',
  async (textEdit) => {
    // キーワード入力
    const keyword = await vscode.window.showInputBox()
    if (!keyword) return

    // データ取得
    let results
    try {
      results = await fetchData(keyword)
    } catch (err) {
      console.error(err)
      return
    }

    // 検索結果表示
    const items = getColors(results)
    const selected = await vscode.window.showQuickPick(items)
    if (!selected) return

    // エディタへ挿入
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const cursorPos = vscode.window.activeTextEditor?.selection.active
    if (!cursorPos) return

    const colorCode = selected.label

    textEdit.edit((editBuilder) => {
      editBuilder.insert(cursorPos, colorCode)
    })
  }
)

function getColors(results: any[]) {
  const items: vscode.QuickPickItem[] = []

  for (const data of results) {
    const item: vscode.QuickPickItem = {
      label: data.color.value,
      description: `${data.label.value} (${data.kana.value})`
    }
    items.push(item)
  }

  return items
}

async function fetchData(keyword: string) {
  const query = `
  PREFIX schema: <http://schema.org/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  
  SELECT DISTINCT ?label?kana ?color
  
  WHERE {
    ?d rdf:type ?type;
       rdfs:label ?label;
       imas:Color ?c.

    FILTER(?type IN (imas:Idol, imas:Staff))

    OPTIONAL{ ?d schema:name ?name }
    OPTIONAL{ ?d imas:nameKana ?kana }
    OPTIONAL{ ?d imas:givenNameKana ?kana }
    OPTIONAL{ ?d imas:alternateNameKana ?kana }

    FILTER(CONTAINS(?label, "${keyword}") || CONTAINS(?name, "${keyword}") || CONTAINS(?kana, "${keyword}")).

    BIND(CONCAT("#", str(?c)) as ?color)
  }
  ORDER BY ?kana
  LIMIT 10
  `

  const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(
    query
  )}`

  try {
    const res = await axios.get(url)

    if (!res.data.results) {
      throw new Error('not data')
    }

    return res.data.results.bindings
  } catch (err) {
    throw new Error(`not access (${err.response.statusText})`)
  }
}
