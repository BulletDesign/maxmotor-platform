module.exports = {
  content: ["./ingenieria.html", "./index.html"],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        "eng-black": "#0b0d10",
        "eng-panel": "#14181d",
        "eng-steel": "#1e242b",
        "eng-orange": "#f02b22",
        "eng-cyan": "#c5c8c2",
        "eng-ink": "#f5f3ec",
      },
      fontFamily: {
        display: ["Teko", "sans-serif"],
        body: ["Montserrat", "sans-serif"],
        ui: ["Barlow Condensed", "sans-serif"],
      },
    },
  },
};
