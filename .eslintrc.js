module.exports = {
	"root": true,
	"env": {
		"node": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:vue/recommended",
		"@vue/airbnb",
		"@vue/prettier"
	],
	"rules": {
		"import/extensions": 0,
		"global-require": 0,
		"eol-last": 0,
		"no-param-reassign": 0,
		"object-curly-newline": 0,
		"no-plusplus": 0,
		"max-len": [
			2,
			{
				"code": 160
			}
		],
		"prefer-destructuring": [
			2,
			{
				"object": true,
				"array": false
			}
		]
	},
	"parserOptions": {
		"parser": "babel-eslint"
	}
}