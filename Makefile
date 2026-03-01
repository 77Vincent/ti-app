.DEFAULT_GOAL := help

NPM := npm
QUESTION_REPEAT_COUNT := 50

.PHONY: help install dev build start lint test check clean clean-deps question question-resolve question-resolve-pool question-english question-chinese question-japanese question-probability cap-add-ios cap-add-android cap-sync cap-open-ios cap-open-android

help:
	@echo "Common commands:"
	@echo "  make install    Install dependencies"
	@echo "  make dev        Start Next.js dev server"
	@echo "  make build      Build production bundle"
	@echo "  make start      Start production server"
	@echo "  make lint       Run lint checks"
	@echo "  make test       Run tests (if test script exists)"
	@echo "  make check      Run lint, test, and build"
	@echo "  make clean      Remove Next.js build output"
	@echo "  make clean-deps Remove node_modules"
	@echo "  make question subcategory=english difficulty=A1  Run question AI tool"
	@echo "  make question-resolve   Resolve QuestionRaw rows until empty and move passed ones to QuestionPool"
	@echo "  make question-resolve-pool   Continuously sample QuestionPool and delete rejected rows (stop manually)"
	@echo "  make question-english  Generate English questions for A1..C2"
	@echo "  make question-chinese  Generate Chinese questions for HSK1..HSK6"
	@echo "  make question-japanese Generate Japanese questions for N5..N1"
	@echo "  make question-probability Generate Probability questions for A..C (GAISE II)"
	@echo "  make cap-add-ios       Create iOS native project via Capacitor"
	@echo "  make cap-add-android   Create Android native project via Capacitor"
	@echo "  make cap-sync          Sync Capacitor config/assets/plugins"
	@echo "  make cap-open-ios      Open iOS project in Xcode"
	@echo "  make cap-open-android  Open Android project in Android Studio"
	@echo "  make up 	  	 Start development environment with Docker Compose"
	@echo "  make reset      Reset the database with Prisma migrate"

install:
	$(NPM) install

dev:
	npx prisma migrate deploy || true
	npx prisma generate || true
	$(NPM) run dev

build:
	$(NPM) run build

start:
	$(NPM) run start

lint:
	$(NPM) run lint

test:
	$(NPM) run test --if-present

check: lint test build

clean:
	rm -rf .next

clean-deps:
	rm -rf node_modules

question:
	$(NPM) run tool:question-generate -- --subcategory "$(subcategory)" --difficulty "$(difficulty)"

question-resolve:
	$(NPM) run tool:question-resolve

question-resolve-pool:
	$(NPM) run tool:question-resolve -- --source pool

question-english:
	for i in $$(seq 1 $(QUESTION_REPEAT_COUNT)); do \
		for d in A1 A2 B1 B2 C1 C2; do \
			$(MAKE) question subcategory=english difficulty=$$d || exit 1; \
		done; \
	done

question-chinese:
	for i in $$(seq 1 $(QUESTION_REPEAT_COUNT)); do \
		for d in HSK1 HSK2 HSK3 HSK4 HSK5 HSK6; do \
			$(MAKE) question subcategory=chinese difficulty=$$d || exit 1; \
		done; \
	done

question-japanese:
	for i in $$(seq 1 $(QUESTION_REPEAT_COUNT)); do \
		for d in N5 N4 N3 N2 N1; do \
			$(MAKE) question subcategory=japanese difficulty=$$d || exit 1; \
		done; \
	done

question-probability:
	for i in $$(seq 1 $(QUESTION_REPEAT_COUNT)); do \
		for d in A B C; do \
			$(MAKE) question subcategory=probability difficulty=$$d || exit 1; \
		done; \
	done

cap-add-ios:
	$(NPM) run cap:add:ios

cap-add-android:
	$(NPM) run cap:add:android

cap-sync:
	$(NPM) run cap:sync

cap-open-ios:
	$(NPM) run cap:open:ios

cap-open-android:
	$(NPM) run cap:open:android

up:
	docker-compose up -d

reset:
	npx prisma migrate reset --force
