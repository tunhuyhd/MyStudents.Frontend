# Font sources

UI typography uses self-hosted WOFF2 files from Google Fonts. No runtime font CDN is required.

- Baloo 2, variable weights 400–800: https://github.com/google/fonts/tree/main/ofl/baloo2
- Be Vietnam Pro, weights 400/500/600/700: https://github.com/google/fonts/tree/main/ofl/bevietnampro
- Binaries: official Google Fonts CSS API and fonts.gstatic.com, retrieved 2026-11-02. Vietnamese, Latin and Latin Extended subsets retained; other scripts omitted.
- SIL Open Font License texts: Baloo2-OFL.txt and BeVietnamPro-OFL.txt.

The exact upstream CSS URL list is retained in `.impeccable/review/new-fonts-source.css` for local audit. Local declarations and unicode ranges are in `src/app/fonts.css`.
