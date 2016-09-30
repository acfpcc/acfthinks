define GetFromPkg
$(shell node -p "require('./src/manifest.json').$(1)")
endef

LAST_VERSION := $(call GetFromPkg,version)

chrome:
	cd src && zip -FSrX ../dist/acfthinks.v$(LAST_VERSION).zip . -x "*.DS_Store"
