const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

// const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = function (passport) {
  // Configure OIDC strategy
  passport.use(
    new OIDCStrategy({
      identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_ID_METADATA}`,
      clientID: process.env.OAUTH_APP_ID,
      responseType: 'code id_token',
      responseMode: 'form_post',
      redirectUrl: process.env.OAUTH_REDIRECT_URI,
      allowHttpForRedirectUrl: true,
      clientSecret: process.env.OAUTH_APP_PASSWORD,
      validateIssuer: false,
      passReqToCallback: false,
      scope: process.env.OAUTH_SCOPES.split(' ')
    },
    signInComplete
  ));

  // Callback function called once the sign-in is complete
  // and an access token has been obtained
  async function signInComplete(iss, sub, profile, accessToken, refreshToken, params, done) {
    if (!profile.oid) {
      return done(new Error("No OID found in user profile."), null);
    }

      try {
        const ObjectID = require('mongodb').ObjectId;
        
        let newUser = {
          _id: new ObjectID(),
          microsoftId: profile.oid,
          displayName: profile.displayName,
        }
        //console.log(profile, accessToken, refreshToken)
        let user = await User.findOne( { microsoftId: newUser.microsoftId })

        if (user) {
           console.log('user found')

          user.accessToken = accessToken
          user.refreshToken = refreshToken
          
          done(null, user)
        } else {
          user = await User.create(newUser)

          user.accessToken = accessToken
          user.refreshToken = refreshToken
          
          console.log('created user')
          done(null, user)
        }

      } catch (err) {
        console.error(err)
      }
  }

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser((id, done) => {
    done(null, id)
  })

}





