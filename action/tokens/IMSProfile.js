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
let openwhisk = require('openwhisk')

class User {
  constructor (profileID, cacheNamespace, cachePackage) {
    openwhisk()
    this.profileID = profileID
    this.cacheNamespace = cacheNamespace
    this.cachePackage = cachePackage || 'cache'
  }

  getProfile (provider) {
    return new Promise((resolve, reject) => {
      let ow = openwhisk()
      ow.actions.invoke({ actionName: '/'+this.cacheNamespace+'/'+this.cachePackage+'/persist', blocking: true, result: true, params: { profileID: this.profileID, provider: provider } })
        .then(res => {
          resolve(res.response.result.profile)
        })
        .catch(err => { reject(err) })
    })
  }

  getAccessToken (provider) {
    return new Promise((resolve, reject) => {
      let ow=openwhisk()
      ow.actions.invoke({ actionName: '/'+this.cacheNamespace+'/'+this.cachePackage+'/persist', blocking: true, result: true, params: { profileID: this.profileID, provider: provider } })
        .then(res => {
          resolve({ accessToken: res.accessToken })
        })
        .catch(err => { reject(err) })
    })
  }

  clearTokens (provider) {
    return new Promise((resolve, reject) => {
      let ow = openwhisk()
      ow.actions.invoke({ actionName: '/'+this.cacheNamespace+'/'+this.cachePackage+'/persist', blocking: true, result: true, params: { profileID: this.profileID, provider: provider, delete: true } })
        .then(() => {
          resolve({ message: 'Profile successfully deleted.' })
        })
        .catch(err => reject(err))
    })
  }
}

module.exports = User
