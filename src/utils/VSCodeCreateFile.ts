import * as vscode from 'vscode';
import { SnippetsUtils } from './SnippetsUtils';
import { OutputUtils } from './OutputUtils';

export class VSCodeCreateFile {
  constructor(private uri: vscode.Uri) {}

  createFromSnnipet = async (fileName: string, snippetLang: Language, prefix: string) => {
    const filePath = vscode.Uri.joinPath(this.uri, fileName);

    // Create file
    await vscode.workspace.fs.writeFile(filePath, Buffer.from(''));

    try {
      // Get snippet file content from language
      const snippets = SnippetsUtils.getGlobalSnippets(snippetLang);
    
      // Inset Snippet in new file
      const fileEditor = await vscode.window.showTextDocument(filePath);
      const currentSnippetBody = SnippetsUtils.getBodyFromSnippet(snippets, prefix);
      await fileEditor.insertSnippet(new vscode.SnippetString(currentSnippetBody));
    } catch(error) {
      OutputUtils.print(error);
    }
  }

  createFilesFromSettings = async (settings: LanguageGeneratorActions, lang: Language, configurationId: string) => {    
    if(settings && settings[configurationId]) {
      for(var index = 0; index < settings[configurationId].length; index++) {
        const setting = settings[configurationId][index];
        if(!setting.file || !setting.snippet) {
          vscode.window.showErrorMessage(`Has a error in "${lang}.${configurationId}". Files not created.`);
          return;
        }
        await this.createFromSnnipet(setting.file, lang, setting.snippet);
        vscode.window.showInformationMessage(`Files created successfully from User "settings.json"`);
      }
    }
  }

  createFilesFromGeneratorSettings = async (settings: GeneratorSettings[], lang: Language) => {    
    for(var index = 0; index < settings.length; index++) {
      const setting = settings[index];
      if(!setting.file || !setting.snippet) {
        vscode.window.showErrorMessage(`Internal error in the Snorlax. GeneratorSettings from "${lang} not defined correctly."`);
        return;
      }
      await this.createFromSnnipet(setting.file, lang, setting.snippet);
      vscode.window.showInformationMessage(`Default files created successfully."`);
    }
  }
}