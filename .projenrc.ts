import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
    author: 'Andreas Sieferlinger',
    authorAddress: 'andreas.sieferlinger@personio.de',
    cdkVersion: '2.93.0',
    defaultReleaseBranch: 'main',
    jsiiVersion: '~5.0.0',
    name: 'cdk-lib-examples',
    projenrcTs: true,
    repositoryUrl: 'https://github.com/webratz/cdk-lib-examples.git',

    deps: ['@aws-cdk/integ-tests-alpha'] /* Runtime dependencies of this module. */,
    // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
    devDeps: ['@aws-cdk/integ-runner'] /* Build dependencies for this module. */,
    // packageName: undefined,  /* The "name" in package.json. */

    prettier: true,
    prettierOptions: {
        settings: {
            semi: true,
            trailingComma: javascript.TrailingComma.ALL,
            singleQuote: true,
            printWidth: 140,
            tabWidth: 4,
        },
    },
});
project.eslint!.addRules({
    'prettier/prettier': [
        'error',
        { semi: true, trailingComma: 'all', singleQuote: true, printWidth: 120, tabWidth: 4 },
    ],
    'max-classes-per-file': ['error', { ignoreExpressions: true, max: 2 }],
    '@typescript-eslint/naming-convention': [
        'error',
        {
            selector: ['variable', 'enumMember'],
            format: ['camelCase', 'UPPER_CASE'],
        },
        {
            selector: 'parameter',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
        },
        {
            selector: 'typeLike',
            format: ['PascalCase'],
        },
        {
            selector: 'objectLiteralProperty',
            format: null,
        },
        {
            selector: 'default',
            format: ['camelCase'],
        },
    ],
});
project.gitignore.addPatterns('cdk-integ.out.*.snapshot');

const integ = project.addTask('integ', {
    exec: 'npx integ-runner --language typescript --parallel-regions eu-central-1 ',
    receiveArgs: true,
});
project.testTask.spawn(integ);

project.addTask('integ:update', {
    exec: 'npx integ-runner --language typescript --parallel-regions eu-central-1  --update-on-failed',
    receiveArgs: true,
});
project.synth();
