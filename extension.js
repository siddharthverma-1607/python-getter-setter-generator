
const vscode = require('vscode');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('python-getter-setter.generatePythonGetterAndSetters', function () {
		// The code you place here will be executed every time your command is executed
		var editor = vscode.window.activeTextEditor;
        if (!editor)
            return; // No open text editor

        var selection = editor.selection;
        var text = editor.document.getText(selection);

        if (text.length < 1)
        {
            vscode.window.showErrorMessage('No selected properties.');
            return;
        }

        try 
        {
            var getterAndSetter = generateGetterSetterMethods(text);

            editor.edit(
                edit => editor.selections.forEach(
                  selection => 
                  {
                    edit.insert(selection.end, getterAndSetter);
                  }
                )
              );

            // format getterAndSetter
            vscode.commands.executeCommand('editor.action.formatSelection');
        } 
        catch (error) 
        {
            console.log(error);
            vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "self.<attribute_name> = value;"');
        }


		// Display a message box to the user
		vscode.window.showInformationMessage('Python Getter Setter generated for the selection!');
	});

	context.subscriptions.push(disposable);
}

//  Generator 2 with property annotations
function generateGetterSetterMethods(pythonCode) {
    const lines = pythonCode.split(/\r?\n/);
  
    let generatedCode = '\n';
  
    for (let line of lines) {
      if (line.trim().startsWith('self.')) {
        // @ts-ignore
        // eslint-disable-next-line no-unused-vars
        const [attribute, value] = line.split('=').map((str) => str.trim());
        const attributeName = attribute.split('.')[1];
		
		if (attributeName.startsWith('_')) {
			const getterMethod = `
    @property
    def ${attributeName.slice(1)}(self):
        return self.${attributeName}
`;
		generatedCode += getterMethod;

		const setterMethod = `
    @${attributeName.slice(1)}.setter
    def ${attributeName.slice(1)}(self, value):
        self.${attributeName} = value
`;
		generatedCode += setterMethod;

		  } else {
			const getterMethod = `
    def get_${attributeName}(self):
        return self.${attributeName}
`;
		generatedCode += getterMethod;

		const setterMethod = `
    def set_${attributeName}(self, value):
        self.${attributeName} = value
`;
		generatedCode += setterMethod;
		  }
      }
    }
  
    return generatedCode;
  }
  
// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
