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
/**
 * The entry point for this action.
 * It should be invoked once the authentication has succeeded.
 * @param params Input object
 * @returns {Promise}
 */
function main(params) {
  // console.log(params);

  return new Promise((resolve, reject) => {

    // make sure the authentication succeeded
    if (params.body == null || typeof(params.body) == "undefined") {
      reject(params);
    }

    if (params.body.profile == null || typeof(params.body.profile) == "undefined") {
      reject(params);
    }

    // console.log("params.body.profile.id=" + params.body.profile.id);
    // TODO: encrypt value
    // the response bellow should be sent to the persistence action
    resolve(params.body/*{
      // cache key is based on the User ID
      key: ":oauth:" + params.body.profile.id,
      value: {
        token: params.body.token,
        refresh_token: params.body.refreshToken,
        profile: params.body.profile._raw
      },
      context: params.body.context
    }*/);
  });
}

function test_web_action(params) {
  return {
    headers: { 'Content-Type': 'application/json' },
    statusCode: 200,
    body: new Buffer(JSON.stringify(params.__ow_headers)).toString('base64')
  }
}

exports.main=main;
exports.test_web_action=test_web_action;
