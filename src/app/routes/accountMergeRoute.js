const _ = require('lodash');
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const request = require('request-promise');
const envHelper = require('./../helpers/environmentVariablesHelper.js')
const dateFormat = require('dateformat')
const uuidv1 = require('uuid/v1')

module.exports = (app) => {

  app.get('/merge/account/u1/initiate', (req, res) => {
    console.log('/merge/account/u1/initiate', req.session.kauth);
    if(!_.get(req, 'kauth.grant.access_token.token')){
      res.status(401).send({
        responseCode: 'UNAUTHORIZED'
      });
      return false;
    }
    req.session.mergeAccountInfo = {
      initiatorAccountDetails: {
        userId: _.get(req, 'session.userId'),
        sessionToken: _.get(req, 'kauth.grant.access_token.token')
      }
    };
    console.log('storing merge account initiator account details', req.session.mergeAccountInfo);
    console.log('logging out merge account initiator');
    const url = `${envHelper.PORTAL_AUTH_SERVER_URL}/realms/${envHelper.PORTAL_REALM}/protocol/openid-connect/logout`;
    const query = '?redirect_uri=http://localhost:3000/merge/account/u2/initiate';
    res.redirect(url + query)
  })

  app.get('/merge/account/u2/initiate', (req, res) => {
    if(!req.session.mergeAccountInfo){
      res.status(401).send({
        responseCode: 'UNAUTHORIZED'
      });
      return false;
    }
    console.log('logging in target account for merge');
    const url = `${envHelper.PORTAL_AUTH_SERVER_URL}/realms/${envHelper.PORTAL_REALM}/protocol/openid-connect/auth`;
    const query = '?client_id=portal&state=3c9a2d1b-ede9-4e6d-a496-068a490172ee&redirect_uri=http://localhost:3000/merge/account/u2/login/callback&scope=openid&response_type=code&version=2&success_message=Login with account to which you want merge';
    res.redirect(url + query)
  })

  app.all('/merge/account/u2/login/callback', async (req, res) => {
    if(!req.session.mergeAccountInfo){
      res.status(401).send({
        responseCode: 'UNAUTHORIZED'
      });
      return false;
    }
    console.log(req.query);
    const u2Token = await verifyAuthToken(req, req.query.code).catch(err => {
      console.log('error', Object.keys(err))
      console.log(err.error);
      console.log('error detals', err.statusCode, err.message)
    })
    console.log('target account logged in: getting access token', u2Token);
    res.send('merge successful')
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
const getHeaders = (req) => {
  return {
  }
}