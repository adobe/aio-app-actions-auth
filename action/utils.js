/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const cookie = require('cookie')
const CONTEXT_COOKIE_DEFAULT_NAME = '__Secure-auth_context'

function readCookies (params, cookieName) {
  cookieName = cookieName|| CONTEXT_COOKIE_DEFAULT_NAME
  let cookies = cookie.parse(params.__ow_headers['cookie'] || '')
  let ctx = cookies[cookieName] ? JSON.parse(cookies[cookieName]) : {}
  ctx.identities = ctx.identities || []
  return ctx
}

function buildResp (message, status) {
  let headers = {
    'content-type': 'application/json',
    'status': status
  }
  //headers = Object.assign({}, extraHeaders, headers)
  let bodyJSON = typeof (message) === 'string' ? { message } : message
  return {
    headers,
    body: bodyJSON
  }
}

function readProfile (ctx) {
  if(ctx.identities.length == 0)
    return;

  for (let i = 0; i < ctx.identities.length; i++) {
    let ident = ctx.identities[i]
    if (ident !== null && typeof (ident) !== 'undefined') {
      if (ident.provider === 'adobe') {
        return ident
      }
    }
  }
}

function readProfileID (ctx) {
  if(ctx.identities.length == 0)
    return;

  for (let i = 0; i < ctx.identities.length; i++) {
    let ident = ctx.identities[i]
    if (ident !== null && typeof (ident) !== 'undefined') {
      if (ident.provider === 'adobe') {
        let profileID = ident.user_id
        return profileID
      }
    }
  }
  return null
}

module.exports = {
  readCookies: readCookies,
  buildResp: buildResp,
  readProfile: readProfile,
  readProfileID: readProfileID
}
