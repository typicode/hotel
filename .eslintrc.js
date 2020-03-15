module.exports = {
  extends: ["standard", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error"
  },
  env: { mocha: true }
};
