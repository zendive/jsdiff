ZIP_CHROME_FILE="extension.chrome.zip"
ZIP_FIREFOX_FILE="extension.firefox.zip"
HASH_ALG="sha384"

.PHONY:
	install clean all lint dev prod zip_chrome zip_firefox
	tune2chrome tune2firefox

install:
	npm i -g pnpm
	pnpm i

clean:
	rm -rf ./node_modules
	rm -rf $(ZIP_CHROME_FILE) $(ZIP_FIREFOX_FILE)
	rm -rf ./bundle/js/

all:
	make lint
	make prod
	make tune2chrome
	make zip_chrome
	make tune2firefox
	make zip_firefox

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

zip_chrome:
	rm -rf $(ZIP_CHROME_FILE)
	zip -r $(ZIP_CHROME_FILE) ./bundle ./manifest.json > /dev/null
	FILE_HASH=$$(openssl dgst -$(HASH_ALG) -binary $(ZIP_CHROME_FILE) | openssl base64 -A); \
		echo "$(ZIP_CHROME_FILE) $(HASH_ALG):$$FILE_HASH"

zip_firefox:
	rm -rf $(ZIP_FIREFOX_FILE)
	zip -r $(ZIP_FIREFOX_FILE) ./bundle ./manifest.json > /dev/null
	FILE_HASH=$$(openssl dgst -$(HASH_ALG) -binary $(ZIP_FIREFOX_FILE) | openssl base64 -A); \
		echo "$(ZIP_FIREFOX_FILE) $(HASH_ALG):$$FILE_HASH"


tune2chrome:
	cp manifest.chrome.json manifest.json

tune2firefox:
	cp manifest.firefox.json manifest.json
