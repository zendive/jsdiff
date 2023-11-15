ZIP_FILE="extension.zip"
HASH_ALG="sha384"

.PHONY:
	install clean all lint dev prod zip

install:
	npm i -g pnpm
	pnpm i

clean:
	rm -rf ./node_modules
	rm -rf $(ZIP_FILE)
	rm -rf ./bundle/js/

all:
	make lint
	make prod
	make zip

lint:
	npx prettier . --write
	npx tsc -noEmit

dev:
	NODE_OPTIONS="--loader=ts-node/esm" \
		npx webpack --progress --watch --mode=development

prod:
	NODE_OPTIONS="--loader=ts-node/esm --no-warnings=ExperimentalWarning" \
		NODE_ENV="production" \
		npx webpack --mode=production

zip:
	rm -rf $(ZIP_FILE)
	zip -r $(ZIP_FILE) ./bundle ./manifest.json > /dev/null
	FILE_HASH=$$(openssl dgst -$(HASH_ALG) -binary $(ZIP_FILE) | openssl base64 -A); \
		echo "$(ZIP_FILE) $(HASH_ALG):$$FILE_HASH"
