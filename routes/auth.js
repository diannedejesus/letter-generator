const express = require('express');
const passport = require('passport');
const router = express.Router();

/* GET auth callback. */
router.get('/signin',
  function  (req, res, next) {
    console.log('Signin was called');
    passport.authenticate('azuread-openidconnect',
      {
        response: res,         
        prompt: 'login',
        failureRedirect: '/',
        failureFlash: true
      }
    )(req,res,next);
  },
  function(req, res) {
    console.log('Signin was called');
    res.redirect('/');
  }
);

router.post('/callback',
  function(req, res, next) {
    console.log('Callback was initiated');
    passport.authenticate('azuread-openidconnect',
      {
        response: res,
        failureRedirect: '/',
        failureFlash: true
      }
    )(req,res,next);
  },
  async function(req, res) {
    console.log('We received a return from AzureAD.');
    console.log(res.req.user)
    //req.session.timeStamp = Date.now()
    req.session.accessToken = res.req.user.accessToken
    req.session.refreshToken = res.req.user.refreshToken
    req.session.microsoftId = res.req.user.microsoftId

    req.session.save(function(err) {
      err ? console.log('session saved') : console.log(err)
    })

    res.redirect('/');
  }
);

router.get('/signout',
  function(req, res) {
    req.session.destroy(function(err) {
      req.logout();
      res.redirect('/');
    });
  }
);

module.exports = router;