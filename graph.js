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
  
  
  getUserDetails: async function(accessToken, userId) {
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
        console.log(error);
      }
    }
  },

  getAllGroups: async function getMyGroups(accessToken, userID) {
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
        console.log(error);
      }
    }
  },

  getAllPlanners: async function getPlanners(accessToken, groupID) {
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
        console.log(error);
      }
    }
  },

  getAllTasks: async function getTasks(accessToken, planID) {
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
        console.log(error);
      }
    }
  },

  getSingleTask: async function getTasks(accessToken, taskID) {
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
        console.log(error);
      }
    }
  },

  getDetailedTask: async function getTasks(accessToken, taskID) {
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
        console.log(error);
      }
    }
  },

  getTaskTitle: async function getTasks(accessToken, taskID) {
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
        console.log(error);
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

  createBucket: async function getMyGroups(accessToken, bucketName, planId) {
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
        console.log(error);
      }
    }
  },

  createTask: async function getMyGroups(accessToken, title, planId, bucketId, assignments = {}) {
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
        console.log(error);
      }
    }
  },

  editTask: async function getMyGroups(accessToken, taskId) {
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
        console.log(error);
      }
    }
  },

  createPlan: async function getMyGroups(accessToken, groupId, planTitle) {
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
        console.log(error);
      }
    }
  },

  updateDetailedTask: async function getTasks(accessToken, taskID, currentEtag, checklistNames, description) {
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
        console.log(error);
      }
    }
  },

//Calendar--------------------------------------------------------------------------

  getEvents: async function getCalendarEvents(accessToken, userId){
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
        console.log(error);
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

