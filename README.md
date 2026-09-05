# Isha portfolio website

Source for [Isha — Selected Work](https://isha-portfolio.vishaalsudarsan.chatgpt.site), copied from its original Sites source repository.

## Files

- `dist/index.html`: complete portfolio page.
- `dist/styles.css`: styling and responsive layouts.
- `dist/isha-portrait.png`: original portrait.
- `dist/rgb_sample_scatter.html`: interactive 3D RGB visualization and its embedded data.
- `dist/converter.js`: additional JavaScript retained from the original source.
- `.openai/hosting.json`: existing Sites project and static directory configuration.

## Preview and edit

This is a static website; no dependency installation or build step is required. Serve `dist` with any static web server, for example:

```sh
python -m http.server 8000 --directory dist
```

Then open http://localhost:8000. Edit the HTML and CSS directly. The page loads Google Fonts, and the RGB visualization loads Plotly 3.1.0 from its CDN, so those features need an internet connection.

Publishing changes to GitHub does not automatically update the existing Sites publication.
