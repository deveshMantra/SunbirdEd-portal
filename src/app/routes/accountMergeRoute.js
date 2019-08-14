const _ = require('lodash');
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const request = require('request-promise');
const envHelper = require('./../helpers/environmentVariablesHelper.js')
const dateFormat = require('dateformat')
const uuidv1 = require('uuid/v1');
const authorizationToken = envHelper.PORTAL_API_AUTH_TOKEN
module.exports = (app) => {

  app.get('/merge/account/u1/initiate', (req, res) => {
    console.log('/merge/account/u1/initiate', req.session);
    if(!_.get(req, 'kauth.grant.access_token.token')){
      res.status(401).send({
        responseCode: 'UNAUTHORIZED'
      });
      return false;
    }
    req.session.mergeAccountInfo = {
      initiatorAccountDetails: {
        userId: _.get(req, 'session.userId'),
        sessionToken: _.get(req, 'kauth.grant.access_token.token'),
        redirectUri: req.query.redirectUri
      }
    };
    console.log('storing merge account initiator account details', req.session.mergeAccountInfo);
    const url = `https://merge.dev.sunbirded.org/auth/realms/${envHelper.PORTAL_REALM}/protocol/openid-connect/auth`;
    const query = '?client_id=portal&state=3c9a2d1b-ede9-4e6d-a496-068a490172ee&redirect_uri=http://localhost:3000/merge/account/u2/login/callback&scope=openid&response_type=code&version=2&success_message=Login with account to which you want merge';
    res.redirect(url + query)
  });

  app.all('/merge/account/u2/login/callback', async (req, res) => {
    if(!req.session.mergeAccountInfo){
      res.status(401).send({
        responseCode: 'UNAUTHORIZED'
      });
      return false;
    }
    console.log(req.query);
    const u2Token = await verifyAuthToken(req, req.query.code).catch(err => {
      console.log('error', Object.keys(err));
      console.log(err.error);
      console.log('error detals', err.statusCode, err.message)
    });
    console.log('target account logged in: getting access token', u2Token);
    const mergeResponse = await initiateAccountMerge(req, u2Token).catch(err => {
      console.log('error', err.error);
      console.log('error detals', err.statusCode, err.message);
      const query = '?status=error&redirect_uri=' + req.session.mergeAccountInfo.initiatorAccountDetails.redirectUri;
      req.session.mergeAccountInfo = null;
      res.redirect('/accountMerge' + query);
    });
    if (_.get(mergeResponse, 'result.result.status') === 'SUCCESS' && mergeResponse.responseCode === 'OK') {
      console.log('mergeResponse coming from backend', mergeResponse);
      const query = '?status=success&redirect_uri=' + req.session.mergeAccountInfo.redirectUri;
      req.session.mergeAccountInfo = null;
      res.redirect('/accountMerge' + query);
    }
  })

}
const handleError = (error) => {
  console.log('refresh token api error', error.error);
  const errorRes = JSON.parse(error.error)
  throw {
    statusCode: error.statusCode,
    error: errorRes.error || 'INVALID_REQUEST',
    message: errorRes.message || errorRes.error_description,
  }
}
const verifyAuthToken = async (req, code) => {
  const options = {
    method: 'POST',
    url: `${envHelper.PORTAL_AUTH_SERVER_URL}/realms/${envHelper.PORTAL_REALM}/protocol/openid-connect/token`,
    headers: getHeaders(req),
    form: {
      client_id: 'portal',
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/merge/account/u2/login/callback'
    }
  }
  console.log('verifyAuthToken', options);
  return request(options);
}

const initiateAccountMerge = async (req, u2Token) => {
  if (u2Token) {
    u2Token = JSON.parse(u2Token);
  }
  var jwtPayload = jwt.decode(u2Token.access_token);
  var userIds = jwtPayload.sub.split(':');
  var u2userId = userIds[userIds.length - 1];
  const options = {
    method: 'PATCH',
    url: `${envHelper.LEARNER_URL}user/v1/account/merge`,
    headers: getAccountMergeHeaders(req, u2Token.access_token),
    body: {
      "params": {},
      "request": {
        "fromAccountId": u2userId,
        "toAccountId": _.get(req, 'session.mergeAccountInfo.initiatorAccountDetails.userId')
      }
    },
    json: true
  };
  console.log('verifyAuthToken sending request for merge', options);
  return await request(options)
};

const getHeaders = (req) => {
  return {
  }
}

const getAccountMergeHeaders = (req, u2AccessToken) => {
  return {
    'x-authenticated-user-token': _.get(req, 'session.mergeAccountInfo.initiatorAccountDetails.sessionToken'),
    'x-source-user-token': u2AccessToken,
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authorizationToken,

  }
}
