# Buildable - Monorepo CLI

Running command:
> npm run buildable -- --script "npm run serve"

To exclude package(s) type env variable beforehand:
> EXCLUDED_PACKAGES=@webeferen/buildable npm run buildable -- --script "npm run serve"

Or install package globally using:
> npm install -g @webeferen/buildable

... and then just use:
> buildable --script "whatever script"
