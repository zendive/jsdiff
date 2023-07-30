#!/bin/sh -e

ZIP_FILE="extension.zip"
HASH_ALG="sha384"

pnpm run prod > /dev/null

rm -rf $ZIP_FILE
zip -r $ZIP_FILE ./bundle ./manifest.json > /dev/null

FILE_HASH=$(openssl dgst -$HASH_ALG -binary $ZIP_FILE | openssl base64 -A)

echo "$ZIP_FILE (hash-$HASH_ALG): $FILE_HASH"
