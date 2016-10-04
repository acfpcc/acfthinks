define GetFromPkg
$(shell node -p "require('./src/manifest.json').$(1)")
endef

LAST_VERSION := $(call GetFromPkg,version)

# Patterns matching JS files that should be minified.
JS_FILES = $(patsubst src/%, temp/%, $(filter-out %-min.js, $(wildcard \
	src/scripts/*.js \
)))

# Command to run to execute the JS Compressor.
JS_COMPRESSOR = java -jar utils/compiler.jar

# Flags to pass to the JS Compressor for JS.
JS_COMPRESSOR_FLAGS = 
JS_MINIFIED = $(JS_FILES:.js=-min.js)

all: copysrc minify-js compress

compress:
	cd temp && zip -FSrX ../dist/acfthinks.v$(LAST_VERSION).zip . -x "*.DS_Store"
	rm -R temp

copysrc:
	cp -R src temp

# target: minify-js - Minifies JS.
minify-js: $(JS_FILES) $(JS_MINIFIED)

%-min.js: %.js
	@echo '==> Minifying $<'
	$(JS_COMPRESSOR) $(JS_COMPRESSOR_FLAGS) --js $< --js_output_file $@
	mv $@ $<
	@echo

# target: clean - Removes minified CSS and JS files.
clean:
	rm -f $(JS_MINIFIED)

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile