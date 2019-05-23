/**
 * Simple Hydra SDK
 * Methods to interact with the Hydra API
 */

var fetch = require('node-fetch')
var uj = require('url-join')
var querystring = require('querystring')
const qs = require('qs')
const { URL } = require('url')

const { serverRuntimeConfig } = require('../../next.config')
const hydraUrl = serverRuntimeConfig.HYDRA_ADMIN_URL

var mockTlsTermination = {}

if (process.env.MOCK_TLS_TERMINATION) {
  mockTlsTermination = {
    'X-Forwarded-Proto': 'https'
  }
}

// A little helper that takes type (can be "login" or "consent") and a challenge and returns the response from ORY Hydra.
function get(flow, challenge) {
  const url = new URL(`/oauth2/auth/requests/${flow}`, hydraUrl)
  url.search = querystring.stringify({[`${flow}_challenge`]: challenge})
  return fetch(url.toString())
    .then(function (res) {
      if (res.status < 200 || res.status > 302) {
        // This will handle any errors that aren't network related (network related errors are handled automatically)
        return res.json().then(function (body) {
          if (res.status != 404) {
            console.error('An error occurred while making a HTTP request: ', body)
          }
          return Promise.reject(new Error(body.error.message))
        })
      }

      return res.json();
    });
}

// A little helper that takes type (can be "login" or "consent"), the action (can be "accept" or "reject") and a challenge and returns the response from ORY Hydra.
function put(flow, action, challenge, body) {
  const url = new URL(`/oauth2/auth/requests/${flow}/${action}`, hydraUrl)
  url.search = querystring.stringify({[`${flow}_challenge`]: challenge})
  return fetch(
    // Joins process.env.HYDRA_ADMIN_URL with the request path
    url.toString(),
    {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...mockTlsTermination
      }
    }
  )
    .then(function (res) {
      if (res.status < 200 || res.status > 302) {
        // This will handle any errors that aren't network related (network related errors are handled automatically)
        return res.json().then(function (body) {
          if (res.status != 404) {
            console.error('An error occurred while making a HTTP request: ', body)
          }
          return Promise.reject(new Error(body.error.message))
        })
      }

      return res.json();
    });
}

function getClients() {
  return fetch(
    uj(hydraUrl, '/clients'),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...mockTlsTermination
      }
    }
  )
    .then(function (res) {
      if (res.status < 200 || res.status > 302) {
        // This will handle any errors that aren't network related (network related errors are handled automatically)
        return res.json().then(function (body) {
          if (res.status != 404) {
            console.error('An error occurred while making a HTTP request: ', body)
          }
          return Promise.reject(new Error(body.error.message))
        })
      }

      return res.json();
    });
}

function createClient(body) {
  return fetch(
    uj(hydraUrl, '/clients'),
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...mockTlsTermination
      }
    }
  )
    .then(function (res) {
      if (res.status < 200 || res.status > 302) {
        // This will handle any errors that aren't network related (network related errors are handled automatically)
        return res.json().then(function (body) {
          if (res.status != 404) {
            console.error('An error occurred while making a HTTP request: ', body)
          }
          return Promise.reject(new Error(body.error.message))
        })
      }

      return res.json();
    });
}

function deleteClient(id) {
  return fetch(
    uj(hydraUrl, `/clients/${id}`),
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...mockTlsTermination
      }
    }
  )
}

/**
 * Check if an access token is valid
 * 
 * @param {String} token Access Token
 */
function introspect (token) {
  const body = qs.stringify({ token })
  return fetch(
    uj(hydraUrl, '/oauth2/introspect'), {
      method: 'POST',
      body,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        ...mockTlsTermination
      }
    })
    .then(r => r.json())
    .then((body) => {
      return body
    })
}

var hydra = {
  // Fetches information on a login request.
  getLoginRequest: function (challenge) {
    return get('login', challenge);
  },
  // Accepts a login request.
  acceptLoginRequest: function (challenge, body) {
    return put('login', 'accept', challenge, body);
  },
  // Rejects a login request.
  rejectLoginRequest: function (challenge, body) {
    return put('login', 'reject', challenge, body);
  },
  // Fetches information on a consent request.
  getConsentRequest: function (challenge) {
    return get('consent', challenge);
  },
  // Accepts a consent request.
  acceptConsentRequest: function (challenge, body) {
    return put('consent', 'accept', challenge, body);
  },
  // Rejects a consent request.
  rejectConsentRequest: function (challenge, body) {
    return put('consent', 'reject', challenge, body);
  },
  createClient,
  deleteClient,
  getClients,
  introspect
};

module.exports = hydra;