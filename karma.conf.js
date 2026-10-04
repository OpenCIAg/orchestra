module.exports = function (config) {
  config.set({
    basePath: '',
    port: Number(process.env.ORC_KARMA_PORT) || 9876,
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: {
        seed: process.env.ORC_JASMINE_SEED || undefined,
        stopOnSpecFailure: process.env.ORC_JASMINE_FAIL_FAST === '1',
      },
      args: process.env.ORC_TEST_COLOR_SCHEME
        ? [process.env.ORC_TEST_COLOR_SCHEME]
        : [],
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
      ChromeHeadlessLightCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--blink-settings=preferredColorScheme=1',
        ],
      },
      ChromeHeadlessDarkCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--blink-settings=preferredColorScheme=0',
        ],
      },
    },
    restartOnFileChange: true,
    singleRun: false,
  });
};
