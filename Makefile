# general-purpose: run `make` to list commands.

SHELL     := /bin/bash
CODE      ?= code
EXT       := vscode-extension
NAME      := $(shell node -p "require('./$(EXT)/package.json').name" 2>/dev/null)
VERSION   := $(shell node -p "require('./$(EXT)/package.json').version" 2>/dev/null)
VSIX      := $(EXT)/dist/$(NAME)-$(VERSION).vsix
DEPS      := $(EXT)/node_modules/.stamp
SOURCES   := $(shell find $(EXT)/src $(EXT)/scripts -type f 2>/dev/null) \
             $(EXT)/package.json $(EXT)/README.md $(EXT)/.vscodeignore

.DEFAULT_GOAL := help

##@ General

.PHONY: help
help: ## List all commands
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage: make \033[36m<target>\033[0m\n"} \
		/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 } \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)
	@echo

##@ VS Code extension

.PHONY: vscode
vscode: $(VSIX) ## Build and install the VS Code extension (safe to re-run)
	@command -v $(CODE) >/dev/null || { echo "✗ '$(CODE)' not found. In VS Code: Cmd+Shift+P → 'Shell Command: Install code command in PATH'"; exit 1; }
	$(CODE) --install-extension $(VSIX) --force
	@echo "✓ Installed. Reload VS Code (Cmd+Shift+P → 'Developer: Reload Window')."

.PHONY: package
package: $(VSIX) ## Build the .vsix without installing

.PHONY: uninstall
uninstall: ## Remove the VS Code extension
	-$(CODE) --uninstall-extension local.$(NAME)

##@ Cleanup

.PHONY: clean
clean: ## Delete build output and node_modules
	rm -rf $(EXT)/dist $(EXT)/node_modules

# ---- Internal ----

$(DEPS): $(EXT)/package.json $(wildcard $(EXT)/package-lock.json)
	@command -v npm >/dev/null || { echo "✗ npm not found: brew install node"; exit 1; }
	npm --prefix $(EXT) install --no-audit --no-fund
	@touch $@

$(VSIX): $(SOURCES) $(DEPS)
	@node $(EXT)/scripts/build-themes.mjs
	@node $(EXT)/scripts/build-icons.mjs
	@node $(EXT)/scripts/validate.mjs
	@mkdir -p $(EXT)/dist
	cd $(EXT) && npx vsce package --allow-missing-repository --skip-license --out dist/$(NAME)-$(VERSION).vsix
