import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "imas-color" is now active!')

  let disposable = vscode.commands.registerCommand(
    'imas-color.helloWorld',
    async () => {
      vscode.window.showInputBox()
      const a = await vscode.window.showQuickPick(['abcd', 'abcd'])

      console.log(a)
      vscode.window.showInformationMessage('Hello World from imas-color!')
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
