const express = require('express');
const passport = require('passport');
const router = express.Router();

/* GET auth callback. */
router.get('/signin',
  function  (req, res, next) {
    console.log('Signin was called');
    //console.log(req)
    passport.authenticate('azuread-openidconnect',
      {
        //response: res,
        //sessin: false,        
        //prompt: 'login',
        failureRedirect: '/err+signin',
        failureFlash: true
      }
    )(req,res,next);
  }
);

function regenerateSessionAfterAuthentication(req, res, next) {
  var passportInstance = req.session.passport;
  return req.session.regenerate(function (err){
    if (err) {
      return next(err);
    }
    req.session.passport = passportInstance;
    return req.session.save(next);
  });
}

router.post('/callback',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/err', failureFlash: true }),
  regenerateSessionAfterAuthentication,
  async function(req, res){
    console.log('We received a response from AzureAD.');
    //req.session.timeStamp = Date.now()
    //req.session.refreshToken = res.req.user.refreshToken
    req.session.accessToken = res.req.user.accessToken
    req.session.microsoftId = res.req.user.microsoftId
    
    req.session.save(function(err) {
      err ? console.log(err) : console.log('session saved')
      res.redirect('/');
    })
  }
)

// router.post('/callback',
//   function(req, res, next) {
//     console.log('Callback was initiated');
//     passport.authenticate('azuread-openidconnect',
//       {
//         //response: res,
//         failureRedirect: '/err',
//         failureFlash: true
//       }
//     )(req,res,next);
//   },
//   async function(req, res) {
//     console.log('We received an response from AzureAD.');
//     //req.session.timeStamp = Date.now()
//     req.session.accessToken = res.req.user.accessToken
//     req.session.refreshToken = res.req.user.refreshToken
//     req.session.microsoftId = res.req.user.microsoftId
    
//     req.session.save(function(err) {
//       err ? console.log('session saved') : console.log(err)
//     })
    
//     res.redirect('/');
//   }
// );

router.get('/signout', function(req, res, next) {
    req.logout(function(err){
      if(err) { return next(err)}
      req.session.destroy(function(err) {
        res.redirect('/');
      });
    });
  }
);

module.exports = router;