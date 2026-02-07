.DEFAULT_GOAL := dev

# Ensure environment dependencies exist
REQUIRED_BINS := deno jq zip tree
$(foreach bin,$(REQUIRED_BINS),$(if $(shell command -v $(bin) 2> /dev/null),,$(error Missing dependency: `$(bin)`)))

CHROME_MANIFEST = ./manifest.chrome.json
CHROME_MANIFEST_VERSION != jq -j '.version' $(CHROME_MANIFEST)
CHROME_ZIP = "extension.chrome-$(CHROME_MANIFEST_VERSION).zip"
FIREFOX_MANIFEST = ./manifest.firefox.json
FIREFOX_MANIFEST_VERSION != jq -j '.version' $(FIREFOX_MANIFEST)
FIREFOX_ZIP = "extension.firefox-$(FIREFOX_MANIFEST_VERSION).zip"
DENO_DEV = BUILD_MODE=development deno run --watch --allow-env --allow-read --allow-run
DENO_PROD = BUILD_MODE=production deno run --allow-env --allow-read --allow-run
OUTPUT_DIR = ./public/
BUILD_DIR = ./public/build/
BUILD_SCRIPT = ./build.ts

.PHONY: clean
clean:
	rm -rf ./node_modules ./deno.lock $(BUILD_DIR) $(CHROME_ZIP) $(FIREFOX_ZIP)

.PHONY: install
install:
	deno install --allow-scripts

.PHONY: update
update:
	deno update --latest

.PHONY: dev
dev:
	rm -rf $(BUILD_DIR)
	$(DENO_DEV) $(BUILD_SCRIPT)

.PHONY: valid
valid:
	deno fmt --unstable-component
	deno lint
	deno check

.PHONY: test
test: valid
	deno test --no-check --trace-leaks --reporter=dot

.PHONY: prod
prod: test
	rm -rf $(BUILD_DIR)
	$(DENO_PROD) $(BUILD_SCRIPT)

.PHONY: tune2chrome
tune2chrome:
	cp $(CHROME_MANIFEST) manifest.json

.PHONY: tune2firefox
tune2firefox:
	cp $(FIREFOX_MANIFEST) manifest.json

.PHONY: all
all: prod
	make tune2firefox
	rm -rf $(FIREFOX_ZIP)
	zip -r $(FIREFOX_ZIP) $(OUTPUT_DIR) ./manifest.json > /dev/null

	make tune2chrome
	rm -rf $(CHROME_ZIP)
	zip -r $(CHROME_ZIP) $(OUTPUT_DIR) ./manifest.json > /dev/null
	zip --delete $(CHROME_ZIP) "$(BUILD_DIR)firefox/*" > /dev/null

	tree -Dis $(BUILD_DIR) *.zip
