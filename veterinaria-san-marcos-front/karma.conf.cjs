module.exports = function (config) {
  config.set({
    frameworks: ["jasmine"],
    files: ["tests-jasmine/**/*.spec.js"],
    preprocessors: {
      "tests-jasmine/**/*.spec.js": ["esbuild"],
    },
    esbuild: {
      bundle: true,
      target: "es2020",
      format: "iife",
    },
    reporters: ["progress"],
    browsers: ["ChromeHeadless"],
    singleRun: true,
    autoWatch: false,
  });
};
