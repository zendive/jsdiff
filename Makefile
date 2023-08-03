ZIP_FILE="extension.zip"
HASH_ALG="sha384"

.PHONY: install all dev prod build format lint clean

install:
	npm i -g pnpm
	pnpm i

all: build

dev:
	NODE_OPTIONS="--loader=ts-node/esm" \
	./node_modules/.bin/webpack --progress --watch --mode=development

prod:
	NODE_OPTIONS="--loader=ts-node/esm --no-warnings=ExperimentalWarning" \
	NODE_ENV="production" \
	./node_modules/.bin/webpack --mode=production

build:
	make lint
	make prod
	
	rm -rf $(ZIP_FILE)
	zip -r $(ZIP_FILE) ./bundle ./manifest.json > /dev/null

	FILE_HASH=$$(openssl dgst -$(HASH_ALG) -binary $(ZIP_FILE) | openssl base64 -A); \
	echo "$(ZIP_FILE) (hash-$(HASH_ALG)): $$FILE_HASH"

format:
	./node_modules/.bin/prettier . --write

lint:
	./node_modules/.bin/tsc -noEmit

clean:
	rm -rf ./node_modules
	rm -rf $(ZIP_FILE)
	rm -rf ./bundle/js/
