const graph = require('@microsoft/microsoft-graph-client');
//const refreshAccessToken =  require('./bin/refreshToken');
////let timeStamp = Date.now()
require('isomorphic-fetch');
//TODO add error catching for if the timed refresh token is not activated before trying to access the 
//api

module.exports = {
  getUserDetails: async function(accessToken, userId) {
    console.log('getUserDetails', userId)
    const client = getAuthenticatedClient(accessToken);

    try {
      ///api call
      const user = await client
      .api(`/users/${userId}`)
      .select('displayName,mail,mailboxSettings,userPrincipalName')
      .get();

      return user;

    } catch (error) {
      if(error.code === 'InvalidAuthenticationToken'){
        //getAccessToken(accessToken)
        console.log('InvalidAuthenticationToken')
      }else{
        console.log(error); // TypeError: failed to fetch
      }
    }
  },

  getAllGroups: async function getMyGroups(accessToken, userID) {
    console.log('getAllGroups')
    try{
      const client = await getAuthenticatedClient(accessToken);

      return await client  
        .api(`/users/${userID}/transitiveMemberOf`)
        .get();
    } catch (error) {
        console.log(error); // TypeError: failed to fetch
    }
  },

  getAllPlanners: async function getPlanners(accessToken, groupID) {
    console.log('getAllPlanners')
    try{
      const client = await getAuthenticatedClient(accessToken);

      return await client
        .api(`/groups/${groupID}/planner/plans`)
        .get();

    } catch (error) {
      console.log(error); // TypeError: failed to fetch
    }
  },

  getAllTasks: async function getTasks(accessToken, planID) {
    console.log('getAllTasks')
    try{
      const client = getAuthenticatedClient(accessToken);

      return await client
        .api(`/planner/plans/${planID}/tasks`)
        .get();

    } catch (error) {
      console.log(error); // TypeError: failed to fetch
    }
  },

  getSingleTask: async function getTasks(accessToken, taskID) {
    console.log('getSingleTask')
    try{
      const client = getAuthenticatedClient(accessToken);

      return await client
        .api(`planner/tasks/${taskID}`)
        .get();

    } catch (error) {
      console.log(error); // TypeError: failed to fetch
    }
  },

  getDetailedTask: async function getTasks(accessToken, taskID) {
    console.log('getDetailedTask')
    try{
      const client = getAuthenticatedClient(accessToken);

      return await client
        .api(`planner/tasks/${taskID}/details`)
        .get();

    } catch (error) {
      console.log(error); // TypeError: failed to fetch
    }
  },

  getTaskTitle: async function getTasks(accessToken, taskID) {
    console.log('getTaskTitle')
    try{
      const client = getAuthenticatedClient(accessToken);

      return await client
        .api(`planner/tasks/${taskID}`)
        .select('title')
        .get();

    } catch (error) {
      console.log(error); // TypeError: failed to fetch
    }
  },


  getUserPlanners: async function getUserPlanners(accessToken, userID) {
    console.log('getUserPlanner')
    let getUserGroups
    try {
      getUserGroups = await this.getAllGroups(accessToken, userID)
    } catch(err) {
      console.log(err); // TypeError: failed to fetch
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
    console.log('searchAllPlanners')
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
            console.log(err); // TypeError: failed to fetch
          }
      }
    ))

    //find task
    console.log('Searched for task')

    return plannerTasks.filter( taskInfo => taskInfo.title.toLowerCase().includes( searchTerm.toLowerCase() ) )
  },

  createBucket: async function getMyGroups(accessToken, bucketName, planId) {
    console.log('createBucket')
    try{
      const client = getAuthenticatedClient(accessToken);
      const plannerBucket = {
        name: bucketName,
        planId: planId,
        orderHint: ' !'
      };

      return await client.api('/planner/buckets')
        .post(plannerBucket);
     
    } catch (error) {
        console.log(error); // TypeError: failed to fetch
    }
  },

  createTask: async function getMyGroups(accessToken, title, planId, bucketId, assignments = {}) {
    console.log('createTask')
    try{
      const client = getAuthenticatedClient(accessToken);
     
      const plannerTask = {
        planId: planId, 
        bucketId: bucketId, 
        title: title,
        assignments: assignments,
      };

      return await client.api('/planner/tasks')
        .post(plannerTask);
     
     
    } catch (error) {
        console.log(error); // TypeError: failed to fetch
    }
  },

  editTask: async function getMyGroups(accessToken, taskId) {
    console.log('editTask')
    try{
      const client = getAuthenticatedClient(accessToken);
     
      const plannerTask = {
        // 'Body': {
        //  ' If-Match': 'W/"JzEtVGFzayAgQEBAQEBAQEBAQEBAQEBARCc="',
        // },
        title: 'Updated task title 2'
      };

      return await client.api(`/planner/tasks/${taskId}`)
      .update(plannerTask);
     
     
    } catch (error) {
        console.log(error); // TypeError: failed to fetch
    }
  },

  createPlan: async function getMyGroups(accessToken, groupId, planTitle) {
    console.log('createPlan') //doesn't work
    try{
      const client = getAuthenticatedClient(accessToken);
     
      const plannerTask = {
        owner: groupId,
        title: planTitle,
      };

      return await client.api('/planner/plans')
      .post(plannerTask);
     
     
    } catch (error) {
        console.log(error); // TypeError: failed to fetch
    }
  },

  updateDetailedTask: async function getTasks(accessToken, taskID, currentEtag, checklistNames, description) {
    console.log('getDetailedTask')
    try{
      const client = getAuthenticatedClient(accessToken);
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
      
      
      return await client
        .api(`planner/tasks/${taskID}/details`)
        .headers({ 'If-Match': currentEtag })
        .update(plannerTask);

    } catch (error) {
      console.log(error); //TypeError: failed to fetch
    }
  },

//Calendar--------------------------------------------------------------------------

  getEvents: async function getCalendarEvents(accessToken, userId){
    console.log('getEvents')
    try{
      const client = getAuthenticatedClient(accessToken);

      return await client.api(`/me/calendarview?startdatetime=2021-08-19T21:20:29.145Z&enddatetime=2021-08-26T21:20:29.145Z`)
        .get();
     
    } catch (error) {
        console.log(error); // TypeError: failed to fetch
    }
  },
  
}


function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate requests
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
  console.log('getAuthenticatedClient')
  return client
}
