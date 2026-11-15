# Isha portfolio website

Source for [Isha — Selected Work](https://isha-portfolio.vishaalsudarsan.chatgpt.site), copied from its original Sites source repository.

## Files

- `dist/index.html`: complete portfolio page.
- `dist/styles.css`: styling and responsive layouts.
- `dist/isha-portrait.png`: original portrait.
- `dist/secfilingsanalyzer/index.html`: stable `ishasingh.cv/secfilingsanalyzer/` entry point for the maintained Filing Notes app.
- `dist/bwtocolorconverter/index.html`: stable `ishasingh.cv/bwtocolorconverter/` entry point for the AWS-hosted BW to Color Converter.

The route wrapper is maintained with the portfolio source; the Filing Notes application remains in its own Sites source project and is embedded here as the stable public entry point.
- `dist/rgb_sample_scatter.html`: interactive 3D RGB visualization and its embedded data.
- `dist/converter.js`: additional JavaScript retained from the original source.
- `.openai/hosting.json`: existing Sites project and static directory configuration.

## Preview and edit

This is a static website; no dependency installation or build step is required. Serve `dist` with any static web server, for example:

```sh
python -m http.server 8000 --directory dist
```

Then open http://localhost:8000. Edit the HTML and CSS directly. The page loads Google Fonts, and the RGB visualization loads Plotly 3.1.0 from its CDN, so those features need an internet connection.

## GitHub Pages deployment

This repository is configured to publish the static site from the `dist` directory using GitHub Pages. Any push to the `main` branch triggers the workflow in `.github/workflows/deploy-pages.yml` and deploys the latest content to the `www.ishasingh.cv` custom domain.

The repository also includes a `CNAME` file with the domain and a `.nojekyll` file for static hosting compatibility.

To finish the live setup in GitHub:

1. In the repository settings, enable GitHub Pages and select the `GitHub Actions` source.
2. Set the custom domain to `www.ishasingh.cv`.
3. Ensure your DNS provider points `www` to the GitHub Pages endpoint and that the GitHub Pages certificate can issue for the domain.
4. Push commits to `main` to publish changes automatically.
