.PHONY:
	install clean install dev valid test prod all
	tune2chrome tune2firefox
.DEFAULT_GOAL := dev

CHROME_ZIP = "extension.chrome.zip"
CHROME_MANIFEST = ./manifest.chrome.json
FIREFOX_ZIP = "extension.firefox.zip"
FIREFOX_MANIFEST = ./manifest.firefox.json
DENO_DEV = NODE_ENV=development deno run --watch
DENO_PROD = NODE_ENV=production deno run
DENO_OPTIONS = --allow-env --allow-read --allow-run
BUILD_SCRIPT = ./build.ts
OUTPUT_DIR = ./public/
BUILD_DIR = ./public/build/

clean:
	rm -rf ./node_modules ./deno.lock $(BUILD_DIR) $(CHROME_ZIP) $(FIREFOX_ZIP)

install:
	deno install --allow-scripts

dev:
	rm -rf $(BUILD_DIR)
	$(DENO_DEV) $(DENO_OPTIONS) $(BUILD_SCRIPT)

valid:
	deno fmt --unstable-component
	deno lint

test: valid
	deno test --no-check --trace-leaks --reporter=dot

prod: test
	rm -rf $(BUILD_DIR)
	$(DENO_PROD) $(DENO_OPTIONS) $(BUILD_SCRIPT)

tune2chrome:
	cp $(CHROME_MANIFEST) manifest.json

tune2firefox:
	cp $(FIREFOX_MANIFEST) manifest.json

all: prod
	make tune2firefox
	rm -rf $(FIREFOX_ZIP)
	zip -r $(FIREFOX_ZIP) $(OUTPUT_DIR) ./manifest.json > /dev/null

	make tune2chrome
	rm -rf $(CHROME_ZIP)
	zip -r $(CHROME_ZIP) $(OUTPUT_DIR) ./manifest.json > /dev/null
	zip --delete $(CHROME_ZIP) "$(BUILD_DIR)firefox/*" > /dev/null

	tree -Dis $(BUILD_DIR) *.zip
