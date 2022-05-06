module.exports = {
  branches: ['main', { name: 'beta', prerelease: true }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['package.json'],
        message:
          'chore(release): set `package.json` to ${nextRelease.version} [skip ci]',
      },
    ],
  ],
}
