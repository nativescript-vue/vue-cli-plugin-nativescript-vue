module.exports = [{
    name: 'applicationId',
    type: 'input',
    message: 'Enter a unique application identifier:',
    default: 'org.nativescript.application',
    validate(applicationId) {
      const idRE = /^([A-Za-z][A-Za-z\d_]*\.)+[A-Za-z][A-Za-z\d_]*$/

      if (!idRE.test(applicationId)) {
        return `Invalid application identifier.
A valid identifier:
 - must contain two or more strings separated by a dot
 - each string must start with a letter
 - each string can only contain numbers, letters and the _ character
Example: com.company.app`
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
    message: 'Is this a brand new project? (Default: No)',
    default: true
  },
  {
    name: 'isNativeOnly',
    type: 'list',
    message: 'Dual Native AND Web development experience or a Native only? (Default: Dual)',
    choices: [{
        name: 'Dual Native AND Web',
        value: 'dual'
      },
      {
        name: 'Native only',
        value: 'native'
      }
    ],
    default: 'dual'
  },
  {
    name: 'isNVW',
    type: 'list',
    message: 'Use Nativescript-Vue-Web to develop web components with Nativescript-Vue like syntax? (Default: No)',
    choices: [
      {
        name: 'I\'ll bring my own web component framework',
        value: false
      },
      {
      name: 'Use Nativescript-Vue-Web component framework',
      value: true
      }
    ],
    default: false,
    when: (answers) => {
      // prompt will only show up if isNativeOnly === 'dual'
      return answers.isNativeOnly === 'dual';
    }
  },
  {
    name: 'templateType',
    type: 'list',
    message: 'What type of template do you want to start with? (Default: Simple)',
    choices: [{
        name: 'Simple',
        value: 'simple'
      },
      {
        name: 'Sidebar (not yet implemented)',
        value: 'sidebar',
        disabled: true
      }
    ],
    default: 'simple'
  }

]
