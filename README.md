[![Version](https://img.shields.io/npm/v/@adobe/aio-app-actions-auth.svg)](https://npmjs.org/package/@adobe/aio-app-actions-auth)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-app-actions-auth.svg)](https://npmjs.org/package/@adobe/aio-app-actions-auth)
[![Build Status](https://travis-ci.com/adobe/aio-app-actions-auth.svg?branch=master)](https://travis-ci.com/adobe/aio-app-actions-auth)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


# actions-auth
Openwhisk Package for setting up actions within shared packages used in authentication flow.

### Installing shared actions

For a quick setup use:

```bash
$ npm run deploy
```

This command sets up 2 packages in a user's namespace( `system` in the example bellow ):

```bash
$ wsk package get oauth --summary
  package /system/oauth
   action /system/oauth/login

$ wsk package get cache --summary
  package /system/cache
   action /system/cache/encrypt
   action /system/cache/persist
```

* the `oauth` package contains the actions `login`, `logout`, `success` and `tokens` with no default parameters
* the `cache` package contains the `encrypt` and `persist` actions

> NOTE: These packages could be publicly available from a `system` package,
so that other namespaces can reference/bind to them. This offers the flexibility to
maintain the supporting actions in a single place, vs having them copied and installed
in each namespace.

## Logging in Users using an Authentication Sequence

The goal is to create an authentication flow that is composed from a sequence of actions:

```
  login -> encrypt -> persist (SET) -> redirect
```

* `login` - uses [actions-auth-passport](https://github.com/adobe/aio-app-actions-auth-passport) action.
* `encrypt` - uses [./action/encrypt.js](action/encrypt.js) to enable sequencing to the persist action (TBD: Will be renamed to `format`).
* `persist` - uses [auth-cache](https://github.com/adobe/aio-app-auth-cache).
* `redirect` - uses `redirect.js` from [actions-auth-passport](https://github.com/adobe/aio-app-actions-auth-passport) action. This action redirects the end user to a confirmation page, after a successful login. The redirect URL can be controlled by either providing a default `redirect_url` to the `login` action, but it can also be overridden for special cases through the `success_redirect` parameters of the `login` action.

The user experience starts with the login action, which takes the end-user through the authentication UI of the corresponding provider. Once the login is successful the sequence executes all the actions, and at the end, the last action should redirect the user to a home page.

### Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
