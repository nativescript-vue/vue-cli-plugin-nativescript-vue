module.exports = [
  {
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
    type: 'confirm',
    message: 'Is this for a Native only project and not also for browsers? (Default: Yes)',
    default: true
  },
  {
    name: 'isNVW',
    type: 'confirm',
    message: 'Do you want to develop dual-use Web & Native components via Nativescript-Vue-Web? (Default: No)',
    default: false
  }

]