SCRIPTS_DIR := scripts
TSX := pnpm tsx

.PHONY: list run

list:
	@ls $(SCRIPTS_DIR)/*.ts | xargs -n1 basename

run:
	$(TSX) $(SCRIPTS_DIR)/$(SCRIPT) $(ARGS)
