import * as vscode from 'vscode'
import { insertIdolColor } from './search'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(insertIdolColor)
}

export function deactivate() {}
