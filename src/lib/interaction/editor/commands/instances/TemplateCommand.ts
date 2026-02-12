// import { FSAGraph } from '$lib/automata/models';
// import { Command } from '../base';
// import { registerCommand } from '../registry';

// export interface TemplateData {}

// export class TemplateCommand extends Command<TemplateData> {
//     static ID = 'template-command';
//     id = TemplateCommand.ID;
//     data: TemplateData;

//     constructor() {
//         super();
//     }

//     execute(fsa: FSAGraph): void {}

//     undo(fsa: FSAGraph): void {}

//     static fromJSON(commandJson: { data: TemplateData }): TemplateCommand {
//         return new TemplateCommand();
//     }
// }

// registerCommand(TemplateCommand.ID, TemplateCommand);
