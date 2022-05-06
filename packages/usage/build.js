const { build } = require('esbuild')
const alias = require('esbuild-plugin-alias')

build({
  bundle: true,
  treeShaking: true,
  minify: process.env.NODE_ENV === 'production',
  watch: !!process.env.WATCH,
  // format: 'esm',
  entryPoints: ['index.ts'],
  outdir: './dist',
  // outExtension: { '.js': '.mjs' },
  define: {
    'process.env.BASE_PATH': JSON.stringify(process.env.BASE_PATH ?? ''),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL ?? ''),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(
      process.env.SUPABASE_ANON_KEY ?? '',
    ),
  },
  plugins: [
    alias({
      '@prisma/client': require.resolve('@prisma/client'),
    }),
  ],
}).catch((e) => {
  console.log(e)
  process.exit(1)
})
