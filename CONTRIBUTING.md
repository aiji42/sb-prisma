# Contributions

:crystal_ball: Thanks for considering contributing to this project! :crystal_ball:

These guidelines will help you send a pull request.

If you're submitting an issue instead, please skip this document.

If your pull request is related to a typo or the documentation being unclear, please click on the relevant page's `Edit`
button (pencil icon) and directly suggest a correction instead.

This project was made with your goodwill. The simplest way to give back is by starring and sharing it online.

Everyone is welcome regardless of personal background.

## Project Structure

This project is built on mono-repo (yarn workspace).

- packages/client (@sb-prisma/client)
    - This is the main code for sb-prisma.
- packages/generator (@sb-prisma/generator)
    - This is the code used when you run prisma generate.
    - Included in @sb-prisma/client dependencies.
- packages/usage
    - This is not published
    - To check the operation of the project

## Development process

First fork and clone the repository.

Run for install dependencies:
```bash
yarn
```

Launch the development process:
```bash
yarn dev
```

Make sure everything is correctly setup with:
```bash
yarn test
```

## How to write commit messages

We use [Conventional Commit messages](https://www.conventionalcommits.org/) to automate version management.

Most common commit message prefixes are:

* `fix:` which represents bug fixes, and generate a patch release.
* `feat:` which represents a new feature, and generate a minor release.