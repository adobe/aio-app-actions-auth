#Copyright 2019 Adobe. All rights reserved.
#This file is licensed to you under the Apache License, Version 2.0 (the "License");
#you may not use this file except in compliance with the License. You may obtain a copy
#of the License at http://www.apache.org/licenses/LICENSE-2.0

#Unless required by applicable law or agreed to in writing, software distributed under
#the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
#OF ANY KIND, either express or implied. See the License for the specific language
#governing permissions and limitations under the License.
OAUTH_PACKAGE_NAME ?= oauth
CACHE_PACKAGE_NAME ?= cache
NAMESPACE ?= $(shell wsk namespace list | grep -v namespaces)
SHARED_NAMESPACE ?= $(NAMESPACE)
SHARED_OAUTH_PACKAGE ?= /$(SHARED_NAMESPACE)/$(OAUTH_PACKAGE_NAME)
SHARED_CACHE_PACKAGE ?= /$(SHARED_NAMESPACE)/$(CACHE_PACKAGE_NAME)
ADOBE_OAUTH_PACKAGE ?= myauthp
AUTH_SEQ_PACKAGE ?= myauths
AUTH_SEQ_NAME ?= $(AUTH_SEQ_PACKAGE)/authenticate
JWTAUTH_SEQ_NAME ?= $(AUTH_SEQ_PACKAGE)/jwtauthenticate

# For AWS DynamoDB (used to store the tokens)
#AWS_ACCESS_KEY_ID:= "XXX"
#AWS_SECRET_ACCESS_KEY:= "XXX"
# Required only if using AWS temporary creds.
#AWS_SESSION_TOKEN:= "XXX"

.PHONY: create-oauth-package
create-oauth-package:
	npm --prefix ./node_modules/actions-auth-passport/ install
	npm --prefix ./node_modules/actions-auth-passport/ run-script prepublish
	wsk package get $(OAUTH_PACKAGE_NAME) --summary || wsk package create $(OAUTH_PACKAGE_NAME) --shared yes
	wsk action update $(OAUTH_PACKAGE_NAME)/login ./node_modules/actions-auth-passport/actions-auth-passport-0.1.0.js
	wsk action update $(OAUTH_PACKAGE_NAME)/success ./node_modules/actions-auth-passport/src/action/redirect.js --main redirect

.PHONY: create-cache-package
create-cache-package:
	npm --prefix ./node_modules/auth-cache-dynamodb/ install
	npm --prefix ./node_modules/auth-cache-dynamodb/ run-script prepublish
	wsk package get $(CACHE_PACKAGE_NAME) --summary || wsk package create $(CACHE_PACKAGE_NAME) --shared yes
ifdef AWS_SESSION_TOKEN
	wsk action update $(CACHE_PACKAGE_NAME)/persist ./node_modules/auth-cache-dynamodb/auth-cache-dynamodb-0.1.0.js  --param accessKeyId $(AWS_ACCESS_KEY_ID) --param secretAccessKey $(AWS_SECRET_ACCESS_KEY) --param sessionToken $(AWS_SESSION_TOKEN)
else
ifdef AWS_SECRET_ACCESS_KEY
	wsk action update $(CACHE_PACKAGE_NAME)/persist ./node_modules/auth-cache-dynamodb/auth-cache-dynamodb-0.1.0.js  --param accessKeyId $(AWS_ACCESS_KEY_ID) --param secretAccessKey $(AWS_SECRET_ACCESS_KEY)
else
	wsk action update $(CACHE_PACKAGE_NAME)/persist ./node_modules/auth-cache-dynamodb/auth-cache-dynamodb-0.1.0.js
endif
endif
#TODO This should be removed or renamed at the very least
	wsk action update $(CACHE_PACKAGE_NAME)/encrypt ./action/encrypt.js

.PHONY: create-jwt-package
create-jwt-package:
	npm --prefix ./node_modules/actions-jwt-ims/ install
	npm --prefix ./node_modules/actions-jwt-ims/ run-script prepublish
	wsk package get $(OAUTH_PACKAGE_NAME) --summary || wsk package create $(OAUTH_PACKAGE_NAME) --shared yes
	wsk action update $(OAUTH_PACKAGE_NAME)/jwtauth ./node_modules/actions-jwt-ims/actions-jwt-ims-0.1.0.js

.PHONY: create-helper-actions
create-helper-actions:
	npm --prefix ./action/ install
	npm --prefix ./action/ run prepublish-tokens
	wsk action update $(OAUTH_PACKAGE_NAME)/tokens ./action/tokens-dist.js --web true
	npm --prefix ./action/ run prepublish-logout
	wsk action update $(OAUTH_PACKAGE_NAME)/logout ./action/logout-dist.js --web true

npm-install:
	npm install

.PHONY: install
install: npm-install create-oauth-package create-cache-package create-jwt-package create-helper-actions

uninstall:
	wsk action delete $(CACHE_PACKAGE_NAME)/persist
	wsk action delete $(CACHE_PACKAGE_NAME)/encrypt
	wsk package delete $(CACHE_PACKAGE_NAME)
	wsk action delete $(OAUTH_PACKAGE_NAME)/login
	wsk action delete $(OAUTH_PACKAGE_NAME)/success
	wsk package delete $(OAUTH_PACKAGE_NAME)
