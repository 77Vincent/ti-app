.DEFAULT_GOAL := help

NPM := npm

.PHONY: help install dev build start lint test check clean clean-deps question

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
	$(NPM) run tool:question-ai -- --subcategory "$(subcategory)" --difficulty "$(difficulty)"

up:
	docker-compose up -d

reset:
	npx prisma migrate reset --force

reset-prod:
	@set -a; \
	. ./.env.prod; \
	set +a; \
	NODE_ENV=production npx prisma migrate reset --force
