module.exports = [
  {
    name: 'applicationId',
    type: 'input',
    message: 'Enter a unique application identifier:',
    default: 'org.nativescript.application',
    validate(applicationId) {
      const idRE = /^([A-Za-z][A-Za-z\d_]*\.)+[A-Za-z][A-Za-z\d_]*$/;

      if (!idRE.test(applicationId)) {
        return `Invalid application identifier.
A valid identifier:
 - must contain two or more strings separated by a dot
 - each string must start with a letter
 - each string can only contain numbers, letters and the _ character
Example: com.company.app`;
      }

      return true;
    }
  },
  {
    name: 'historyMode',
    type: 'confirm',
    message: 'Use HTML5 history mode? (Default: hash mode)',
    default: false
  },
  {
    name: 'isNewProject',
    type: 'confirm',
    message: 'Is this a brand new project? (Default: Yes)',
    default: true
  },
  {
    name: 'isNativeOnly',
    type: 'list',
    message: 'Dual Native AND Web development experience or a Native only? (Default: Dual)',
    choices: [
      {
        name: 'Dual Native AND Web',
        value: false
      },
      {
        name: 'Native only',
        value: true
      }
    ],
    default: false
  },
  {
    name: 'templateType',
    type: 'list',
    message: 'What type of template do you want to start with? (Default: Simple)',
    choices: [
      {
        name: 'Simple',
        value: 'simple'
      },
      {
        name: 'Nativescript-Vue-Web - The Simple template, but with NS-Vue like syntax for web components',
        value: 'nvw',
        disabled: (answers) => {
          return answers.isNativeOnly === true;
        }
      },
      {
        name: 'Sidebar (not yet implemented)',
        value: 'sidebar',
        disabled: true
      }
    ],
    default: 'simple'
  }
];
