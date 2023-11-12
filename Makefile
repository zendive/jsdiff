ZIP_FILE="extension.zip"
HASH_ALG=sha384

.PHONY:
	install all dev prod build zip print_zip_hash format lint clean

install:
	npm i -g pnpm
	pnpm i

all: build

dev:
	NODE_OPTIONS="--loader=ts-node/esm" \
		npx webpack --progress --watch --mode=development

prod:
	NODE_OPTIONS="--loader=ts-node/esm --no-warnings=ExperimentalWarning" \
		NODE_ENV="production" \
		npx webpack --mode=production

build:
	make lint
	make prod
	make zip
	make print_zip_hash

zip:
	rm -rf $(ZIP_FILE)
	zip -r $(ZIP_FILE) ./bundle ./manifest.json > /dev/null

print_zip_hash: 
	FILE_HASH=$$(openssl dgst -$(HASH_ALG) -binary $(ZIP_FILE) | openssl base64 -A); \
		echo "$(ZIP_FILE) $(HASH_ALG):$$FILE_HASH"

format:
	npx prettier . --write

lint:
	npx tsc -noEmit

clean:
	rm -rf ./node_modules
	rm -rf $(ZIP_FILE)
	rm -rf ./bundle/js/
