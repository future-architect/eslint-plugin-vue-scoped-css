#!/usr/bin/env bash

# check this version is enable to release or not
npx can-npm-publish
if [ $? -eq 1 ] ; then
  exit 0
fi

npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN
npm publish
