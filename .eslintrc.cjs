module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'eslint-plugin-import', '@stylistic'],
	rules: {
		'sort-imports': [
			'error',
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
			},
		],
		'import/order': [
			1,
			{
				'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
				'newlines-between': 'always',
				'pathGroups': [
					{
						pattern: 'react',
						group: 'builtin',
						position: 'before',
					},
					{
						pattern: 'components',
						group: 'internal',
					},
					{
						pattern: 'common',
						group: 'internal',
					},
					{
						pattern: 'routes/ **',
						group: 'internal',
					},
					{
						pattern: 'assets/**',
						group: 'internal',
						position: 'after',
					},
				],
				'distinctGroup': true,
				'pathGroupsExcludedImportTypes': ['react'],
				'alphabetize': {
					order: 'asc',
					caseInsensitive: true,
				},
			},
		],
		'@stylistic/no-multiple-empty-lines': [1, { max: 1 }],
		'no-throw-literal': 0,
		'prettier/prettier': 0,
		'react/react-in-jsx-scope': 0,
		'react-native/no-inline-styles': 0,
		'@typescript-eslint/no-non-null-assertion': 0,
		'react-hooks/exhaustive-deps': 0,
		'radix': 0,
		'react/no-unstable-nested-components': 0,
	},
	extends: ['@react-native-community/eslint-config', 'plugin:@typescript-eslint/recommended'],
};
