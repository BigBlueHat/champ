# change URL to http://USER:PASS@localhost... to match your setup's admin user
URL = http://localhost:5984
DB = champ_dev

all: dev test clean

test:
	@./node_modules/.bin/mocha --reporter spec --timeout 10000

dev:
	@curl -silent $(URL) > /dev/null || couchdb -b
	@sleep 1
	@curl -silent -X DELETE $(URL)/$(DB) > /dev/null
	@curl -silent -X PUT $(URL)/$(DB) > /dev/null
	@./bin/champ push $(URL)/$(DB) ./test/fixtures

clean:
	@rm couchdb.stderr couchdb.stdout

.PHONY: test dev
