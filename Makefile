
all: test dev clean

test:
	@./node_modules/.bin/mocha --reporter spec

dev:
	@curl -silent http://localhost:5984 > /dev/null || couchdb -b
	@sleep 1
	@curl -silent -X DELETE http://localhost:5984/champ > /dev/null
	@curl -silent -X PUT http://localhost:5984/champ > /dev/null
	@./bin/champ push http://localhost:5984/champ ./test/fixtures

clean:
	@rm couchdb.stderr couchdb.stdout

.PHONY: test dev
