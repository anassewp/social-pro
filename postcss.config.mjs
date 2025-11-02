const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'tailwindcss/nesting': {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' && {
      'postcss-discard-duplicates': {},
      'postcss-merge-rules': {},
      'postcss-combine-duplicated-selectors': {},
    }),
  },
};

export default config;
