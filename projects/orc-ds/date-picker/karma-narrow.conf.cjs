const rootConfig = require("../../../karma.conf.js");

module.exports = function configureDatePickerNarrow(config) {
  rootConfig(config);
  config.set({
    browsers: ["ChromeHeadlessNarrow"],
    client: {
      jasmine: { stopOnSpecFailure: true },
      args: ["date-picker-narrow"],
      clearContext: false,
    },
    customLaunchers: {
      ChromeHeadlessNarrow: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-gpu", "--window-size=640,800"],
      },
    },
    port: 9883,
    singleRun: true,
    restartOnFileChange: false,
  });
};
