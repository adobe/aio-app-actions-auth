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
/* eslint-env mocha */

const assert = require('assert')

const utils = require('../../action/tokens/utils.js')
const testvars = require('./testvars.js')

describe('utils: readCookies', () => {
  describe('utils.validateParams', () => {
//params.__ow_headers['cookie'][cookieName].identities.[provider,user_id,accessToken]

    const params = { '__ow_headers': {
                      'cookie': '__Secure-auth_context='+JSON.stringify(testvars.cookieValueNoPersistence)
                    } }

    it('should extract from valid cookie', () => {
      const res = utils.readCookies(params)
      assert.deepEqual(res, testvars.cookieValueNoPersistence)


    })
  })
})
