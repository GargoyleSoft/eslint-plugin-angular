/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,

    // A preset that is used as a base for Jest's configuration
    preset: 'ts-jest',

    // The root directory that Jest should scan for tests and modules within
    rootDir: './tests/lib/rules',

    // The regexp pattern or array of patterns that Jest uses to detect test files
    testRegex: 'nent\.spec\.ts$',

    // Indicates whether each individual test should be reported during the run
    silent: false,
    verbose: true
}
