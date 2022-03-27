// //const util = require('util')
// //const refreshAccessToken =  require('../bin/refreshToken');

// module.exports = {
//     ensureAuth: async function (req, res, next) {
//       if (req.isAuthenticated()) {
        
//         const timeElapsed = Math.floor((Date.now() - req.session.timeStamp) /1000)
//         console.log('verified time: ', timeElapsed)

//         if(timeElapsed > 3500){
//           console.log('timed token refresh')
//           try{
//               //let tokenInfo = await refreshAccessToken.getJSON(req.session.refreshToken)
//               //req.session.accessToken = tokenInfo.access_token
//               //req.session.refreshToken = tokenInfo.refresh_token

//               req.session.save(function(err){
//                   console.log('saved:', err)
//                   req.session.timeStamp = Date.now()
//               })
//           }catch (error){
//               console.log(error)
//           }
//         }

//         return next()
//       } else {
//         res.redirect('/')
//       }
//     },

//     ensureGuest: function (req, res, next) {
//       if (!req.isAuthenticated()) {
//         return next();
//       } else {
//         res.redirect('/');
//       }
//     },
// }