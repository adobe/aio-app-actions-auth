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

function main(params){
  let redirect_url = params.redirect_url
  let cookie_path = params.cookie_path
  const CONTEXT_COOKIE_NAME = params.cookieName || '__Secure-auth_context'
  var ctx = readCookies(params, CONTEXT_COOKIE_NAME)

  return {
    headers: {
      'Location': redirect_url,
      'Set-Cookie': '__Secure-auth_context=' + JSON.stringify(ctx) + '; Secure; Max-Age=1; Path=/api/v1/web/' + cookie_path
    },
    statusCode: 302,
    body: ""
  }
}

function readCookies (params, cookieName) {
  var cookies = cookie.parse(params.__ow_headers['cookie'] || '')
  var ctx = cookies[cookieName] ? JSON.parse(cookies[cookieName]) : {}
  ctx.identities = ctx.identities || []
  return ctx
}

exports.main=main
