const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
//TODO add error catching for if the timed refresh token is not activated before trying to access the 
//api

module.exports = {
  init: function(accessToken){
    // Initialize Graph client
    
    const client = graph.Client.init({
      // Use the provided access token to authenticate requests
        authProvider: (done) => {
          done(null, accessToken);
        }
    });

    this.client = client
    console.log('getAuthenticatedClient')
    //return client
    return this
  },
  
  
  getUserDetails: async function(userId) {
     console.log(!this.client, this.client)
    // if(!client){
    //   client = await getAuthenticatedClient(accessToken);
    // }

    try {
      //api call
      const user = await this.client
      .api(`/users/${userId}`)
      .select('displayName,mail,userPrincipalName')
      .get();

      return user;

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: getUserDetails from graph.js");
        throw error
      }
    }
  },

  getAllGroups: async function getMyGroups(userID) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client  
        .api(`/users/${userID}/transitiveMemberOf`)
        .get();
    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: getAllGroups from graph.js");
        throw error
      }
    }
  },

  getAllPlanners: async function getPlanners(groupID) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client
        .api(`/groups/${groupID}/planner/plans`)
        .get();

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else if(error.statusCode === 403) {
        console.log(error.body);
      }
      else{
        console.log("Error originated in: getAllPlanners from graph.js");
        throw error
      }
    }
  },

  getPlanner: async function getPlanner(planID) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client
        .api(`/planner/plans/${planID}`)
        .get();

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else if(error.statusCode === 403) {
        console.log(error.body);
      }
      else{
        console.log("Error originated in: getPlanner from graph.js");
        throw error
      }
    }
  },

  getPlannerDetails: async function getPlanner(planID) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client
        .api(`/planner/plans/${planID}/details`)
        .get();

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else if(error.statusCode === 403) {
        console.log(error.body);
      }
      else{
        console.log("Error originated in: getPlannerDetails from graph.js");
        throw error
      }
    }
  },

  getAllTasks: async function getTasks(planID) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client
        .api(`/planner/plans/${planID}/tasks`)
        .get();

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: getAllTasks from graph.js");
        throw error
      }
    }
  },

  getSingleTask: async function getTasks(taskID) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client
        .api(`planner/tasks/${taskID}`)
        .get();

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: getSingleTask from graph.js");
        throw error
      }
    }
  },

  getDetailedTask: async function getTasks(taskID) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client
        .api(`planner/tasks/${taskID}/details`)
        .get();

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: getDetailedTask from graph.js");
        throw error
      }
    }
  },

  getTaskTitle: async function getTasks(taskID) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client
        .api(`planner/tasks/${taskID}`)
        .select('title')
        .get();

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: getTaskTitle from graph.js");
        throw error
      }
    }
  },


  getUserPlanners: async function getUserPlanners(accessToken, userID) {
    let getUserGroups

    try {
      getUserGroups = await this.getAllGroups(accessToken, userID)
    } catch(err) {
      //send error to caller
      throw err
    }

    let planners = []
  
    await Promise.all(getUserGroups.value.map(
      async (groupInfo) => {
        if(groupInfo.displayName != 'Global Administrator'){
          try {
            const getPlanner  = await this.getAllPlanners(accessToken, groupInfo.id)
            if(getPlanner && getPlanner.value.length > 0){
              planners.push({planner: getPlanner.value, group: groupInfo.id})
            }
          } catch(err) {
            console.log(err); // TypeError: failed to fetch
          }
        }
      }
    ))
    return planners
   
  },

  searchAllPlanners: async function (accessToken, userID, searchTerm){
    try {
      const planners = await this.getUserPlanners(accessToken, userID)
      let plannerIDs = []
      let plannerTasks = []

      planners.forEach(plannerGroup => {
        plannerGroup.planner.forEach(plannerInfo => {
          return plannerIDs.push({id: plannerInfo.id, group: plannerGroup.group, name: plannerInfo.title})
        })
      })

      await Promise.all(plannerIDs.map(
        async (plannerInfo) => {
            try {
              const getTasks  = await this.getAllTasks(accessToken, plannerInfo.id)
  
              getTasks.value.forEach(taskInfo => {
                plannerTasks.push({title: taskInfo.title, id: plannerInfo.id, group: plannerInfo.group, planName: plannerInfo.name})
              })
  
            } catch(err) {
              console.log(err);
            }
          }
      ))

      //find task
      return plannerTasks.filter( taskInfo => taskInfo.title.toLowerCase().includes( searchTerm.toLowerCase() ) )

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log(error);
      }
    }

  },

  createBucket: async function getMyGroups(bucketName, planId) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      const plannerBucket = {
        name: bucketName,
        planId: planId,
        orderHint: ' !'
      };

      return await this.client.api('/planner/buckets')
        .post(plannerBucket);
     
    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: createBucket from graph.js");
        throw error
      }
    }
  },

  createTask: async function getMyGroups(title, planId, bucketId, assignments = {}) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }
     
      const plannerTask = {
        planId: planId, 
        bucketId: bucketId, 
        title: title,
        assignments: assignments,
      };

      return await this.client.api('/planner/tasks')
        .post(plannerTask);
     
    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("createTask from graph.js");
        throw error
      }
    }
  },

  editTask: async function getMyGroups(taskId) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }
     
      const plannerTask = {
        // 'Body': {
        //  ' If-Match': 'W/"JzEtVGFzayAgQEBAQEBAQEBAQEBAQEBARCc="',
        // },
        title: 'Updated task title 2'
      };

      return await this.client.api(`/planner/tasks/${taskId}`)
      .update(plannerTask);
     
     
    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: editTask from graph.js");
        throw error
      }
    }
  },

  createPlan: async function getMyGroups(groupId, planTitle) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }
     
      const plannerTask = {
        owner: groupId,
        title: planTitle,
      };

      return await this.client.api('/planner/plans')
      .post(plannerTask);
     
     
    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("createPlan from graph.js");
        throw error
      }
    }
  },

  updateDetailedTask: async function getTasks(taskID, currentEtag, checklistNames, description) {
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      let checklistItems = {
        checklist: {},
        description: description,
    }
      let num = 0

      for (names of checklistNames){
        checklistItems.checklist[`95e27074-6c4a-447a-aa24-9d718a0b86${num}`] = {
            "@odata.type": "microsoft.graph.plannerChecklistItem",
            "title": names,
            "isChecked": false
        }
        num++
      }

      const plannerTask = checklistItems
      
      
      return await this.client
        .api(`planner/tasks/${taskID}/details`)
        .headers({ 'If-Match': currentEtag })
        .update(plannerTask);

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: updateDetailedTask from graph.js");
        throw error
      }
    }
  },

//Calendar--------------------------------------------------------------------------

  getEvents: async function getCalendarEvents(userId){
    try{
      // if(!client){
      //   client = await getAuthenticatedClient(accessToken);
      // }

      return await this.client.api(`/me/calendarview?startdatetime=2021-08-19T21:20:29.145Z&enddatetime=2021-08-26T21:20:29.145Z`)
        .get();
     
    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //send error to caller
        throw error
      }else{
        console.log("Error originated in: getEvent from graph.js");
        throw error
      }
    }
  },
}


// let client;

//   function getAuthenticatedClient(accessToken) {
//     // Initialize Graph client
    
//     const client = graph.Client.init({
//       // Use the provided access token to authenticate requests
//         authProvider: (done) => {
//           done(null, accessToken);
//         }
//     });

//     console.log('getAuthenticatedClient')
//     return client
//   }

