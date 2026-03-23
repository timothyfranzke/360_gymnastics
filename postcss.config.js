module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    // Only apply these optimizations in production
    ...(process.env['NODE_ENV'] === 'production' ? [
      require('cssnano')({
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // Optimize CSS for better compression
          normalizeWhitespace: true,
          discardUnused: true,
          mergeIdents: true,
          reduceIdents: true,
          mergeRules: true,
          mergeLonghand: true,
          colormin: true,
          minifyFontValues: true,
          minifyParams: true,
          minifySelectors: true
        }]
      })
    ] : [])
  ]
};