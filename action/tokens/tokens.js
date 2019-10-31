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
const utils = require('../utils.js')
const IMSProfile = require('./IMSProfile.js')
const DEFAULT_PROVIDER = 'adobe'

function main (params) {
  let jwtClientID = params.jwt_client_id || null
  let cacheNamespace = params.cache_namespace || '23294_54687'
  let cachePackage = params.cache_package || 'cache'
  let cookieName = params.cookieName
  let persistence = (params.persistence || 'false').toString().toLowerCase()
  let imsProfile = null
  let provider = params.provider || DEFAULT_PROVIDER

  return new Promise((resolve) => {
    if(jwtClientID != null && persistence === 'true'){ //JWT
      imsProfile = new IMSProfile(jwtClientID, cacheNamespace, cachePackage)
      imsProfile.getAccessToken(provider)
        .then(res => {
          resolve({'token' : res.accessToken})
        })
        .catch(err => {
          resolve({'message' : err.message})
        })
    } else if(params.profileID && persistence === 'true'){ //Non web-action for both code and jwt
      imsProfile = new IMSProfile(params.profileID, cacheNamespace, cachePackage)
      imsProfile.getAccessToken(provider)
        .then(res => {
          resolve({ 'token': res.accessToken })
        })
        .catch(err => {
          resolve(err)
        })
    } else { //web-action for auth code
      let ctx = null
      try {
        ctx = utils.readCookies(params, cookieName)
      }catch (error){
        resolve(utils.buildResp("Not logged in or no JWT clientID", 401))
      }
      if (ctx.identities.length == 0)
        resolve(utils.buildResp("Not logged in or no JWT clientID", 401))

      let profile = utils.readProfile(ctx)
      if(typeof(profile) == 'undefined' || !profile.user_id)
        resolve(utils.buildResp("Not logged in or no JWT clientID", 401))

      if(profile.accessToken)
        resolve(utils.buildResp({ 'token': profile.accessToken}, 200))

      if(persistence === 'true'){
        imsProfile = new IMSProfile(profile.user_id, cacheNamespace, cachePackage)
        imsProfile.getAccessToken(provider)
          .then(res => {
            resolve(utils.buildResp({ 'token': res.accessToken }, 200))
          })
          .catch(err => {
            resolve(utils.buildResp(err.message, 500))
          })
      }else {
        resolve()
      }
    }
  })
}

export default main
