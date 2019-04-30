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
var IMSProfile = require('./IMSProfile.js')

function main (params) {
  var jwtClientID = params.jwt_client_id || null
  var cacheNamespace = params.cache_namespace || '23294_54687'
  var cachePackage = params.cache_package || 'cache'
  const CONTEXT_COOKIE_NAME = params.cookieName || '__Secure-auth_context'
  var imsProfile = null

  return new Promise((resolve, reject) => {
    if(jwtClientID != null){ // web-action for jwt
      imsProfile = new IMSProfile(jwtClientID, cacheNamespace, cachePackage)
      imsProfile.getAccessToken('adobe')
        .then(res => {
          tokens = res.accessToken
          resolve(buildResp({ 'token': tokens }, 200))
        })
        .catch(err => {
          resolve(buildResp(err.message, 500))
        })
    } else if(params.profileID){ //Non web-action for both code and jwt
      imsProfile = new IMSProfile(params.profileID, cacheNamespace, cachePackage)
      imsProfile.getAccessToken('adobe')
        .then(res => {
          resolve({ 'token': res.accessToken })
        })
        .catch(err => {
          resolve(err)
        })
    } else { //web-action for auth code
      var ctx = null
      try {
        ctx = readCookies(params, CONTEXT_COOKIE_NAME)
      }catch (error){
        resolve(buildResp("Not logged in or no JWT clientID", 401))
      }
      if (ctx.identities.length == 0)
        resolve(buildResp("Not logged in or no JWT clientID", 401))

      let profileID = readProfileID(ctx)
      if(profileID == null)
        resolve(buildResp("Not logged in or no JWT clientID", 401))

      imsProfile = new IMSProfile(profileID, cacheNamespace, cachePackage)
      imsProfile.getAccessToken('adobe')
        .then(res => {
          console.log("got the accesstoken")
          tokens = res.accessToken
          resolve(buildResp({ 'token': tokens }, 200))
        })
        .catch(err => {
          resolve(buildResp(err.message, 500))
        })
    }
  })
}

function buildResp (message, status, extraHeaders) {
  console.log(message)
  let headers = {
    'content-type': 'application/json',
    'status': status
    //...extraHeaders
  }
  //headers = Object.assign({}, extraHeaders, headers)
  let bodyJSON = typeof (message) === 'string' ? { message } : message
  return {
    headers,
    body: bodyJSON
  }
}

function readCookies (params, cookieName) {
  var cookies = cookie.parse(params.__ow_headers['cookie'] || '')
  var ctx = cookies[cookieName] ? JSON.parse(cookies[cookieName]) : {}
  ctx.identities = ctx.identities || []
  return ctx
}

function readProfileID (ctx) {
  if(ctx.identities.length == 0)
    return;

  for (var i = 0; i < ctx.identities.length; i++) {
    let ident = ctx.identities[i]
    if (ident !== null && typeof (ident) !== 'undefined') {
      if (ident.provider === 'adobe') {
        var profileID = ident.user_id
        console.log("profileID is :"+profileID)
        return profileID
      }
    }
  }
  return null
}

exports.main=main
