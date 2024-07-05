const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const User = require('../models/User')

module.exports = function (passport) {
  // Configure OIDC strategy
  passport.use(
    new OIDCStrategy({
      identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_ID_METADATA}`,
      clientID: process.env.OAUTH_APP_ID,
      responseType: 'code',
      responseMode: 'form_post',
      redirectUrl: process.env.OAUTH_REDIRECT_URI,
      allowHttpForRedirectUrl: true,
      clientSecret: process.env.OAUTH_APP_PASSWORD,
      validateIssuer: false,
      //isB2C: config.creds.isB2C,
      //issuer: config.creds.issuer,
      passReqToCallback: false,
      scope: process.env.OAUTH_SCOPES.split(' '),
      loggingLevel: 'info', //gives informational data
      //loggingNoPII: false,
      // nonceLifetime: config.creds.nonceLifetime,
      // nonceMaxAmount: config.creds.nonceMaxAmount,
      // useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
      // cookieSameSite: config.creds.cookieSameSite, // boolean
      // cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
      // clockSkew: config.creds.clockSkew,
      // proxy: { port: 'proxyport', host: 'proxyhost', protocol: 'http' },
    },
    signInComplete
  ));

  // Callback function called once the sign-in is complete
  // and an access token has been obtained
  async function signInComplete(iss, sub, profile, accessToken, refreshToken, params, done) {
    if (!profile.oid) {
      return done(new Error("No OID found in user profile."), null);
    }

    console.log("sign in complete")
    //console.log(refreshToken, params)
    process.nextTick(async function () {
      let user = await User.findOne( { microsoftId: profile.oid })

      if (!user) {
        console.log('user not found')

        let newUser = {
          microsoftId: profile.oid,
          displayName: profile.displayName,
        }

        user = await User.create(newUser)
      }

      console.log("access: ", accessToken)
      console.log("refreshToken: ", refreshToken)

      user.accessToken = accessToken
      user.refreshToken = refreshToken
      done(null, user)
    })
  }

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser((id, done) => {
    done(null, id)
  })

}





