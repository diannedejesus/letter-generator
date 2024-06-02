//const ewsOptions = require('../ewsConnections')
const graph = require('../graph')
const Settings = require('../models/Settings')

module.exports = { 
    index: async (req, res)=>{
        try{
            //console.log("mainCntr.js - index", res)
            if(!req.session.accessToken){
                return res.render('index.ejs', { 
                    planners: undefined,
                    settings: undefined,
                    errors: "You need to Sign in to your 365 Account"
                })
            }

            let plans, taskList

            if(!req.session.planner){
                console.log("set planner")
                const settings = await Settings.findOne({ microsoftId: req.session.microsoftId })

                if(settings){
                    req.session.planner = {
                        planName: settings.plannerName,
                        planId: settings.plannerId
                    }
                }else{
                    console.log("no set planner found")
                    plans = await graph.getUserPlanners(req.session.accessToken, req.session.microsoftId)
                }
            }
            
            if(req.session.planner && !req.session.tasks){
                console.log("set tasklist")
                taskList = await graph.getAllTasks(req.session.accessToken, req.session.planner.planId)
                taskList = removeCompletedTasks(taskList.value)
                taskList = taskList.map(task => retrieveIdTitle(task))

                for(let i=0; i<taskList.length; i++){
                    const taskDetails = await graph.getDetailedTask(req.session.accessToken, taskList[i].id)
                    const theDetails = retrieveDetails(taskDetails)

                    taskList[i] = {...taskList[i], ...theDetails}
                }

                req.session.tasks = taskList
            }

            //console.log(req.session.tasks)

            res.render('index.ejs', { 
                planners: plans ? plans[0] : undefined,
                settings: req.session.planner ? req.session.planner : undefined,
                tasks: req.session.tasks ? req.session.tasks : undefined
            })

        }catch(err){
            if(err.code === 'InvalidAuthenticationToken'){
                //getAccessToken(accessToken)
                console.log('InvalidAuthenticationToken index-mainCntr')

                res.render('index.ejs', { 
                    planners: undefined,
                    settings: undefined,
                    errors: "You need to Sign in to your 365 Account"
                })
            }else{
                console.log("main error:", err); // TypeError: failed to fetch
            }
        }
    },

    setPlan: async (req, res)=>{
        try {
            if(!req.body || !req.body.plan){
                console.log("No values found.")
                res.redirect('/')
            }else{
                const savedSettings = await Settings.findOne({ microsoftId: req.session.microsoftId })
                const plan = JSON.parse(req.body.plan)
                if(!savedSettings){
                    const setSettings = {
                        microsoftId: req.session.microsoftId,
                        plannerId: plan.planId,
                        plannerName: plan.planName,
                    }

                    const createdSetting = await Settings.create(setSettings)

                    if(createdSetting){
                        res.status(201)
                        res.redirect('/')
                    }else{
                        res.redirect('/')
                    }

                    //page status code
                }else{
                    console.log("Settings for this user already exist, did you want to update the current settings?")
                }
                
            }
            

        } catch (error) {
            console.log(error)
        }
        
    },

    generateLetters: async (req, res)=>{
        try {        
            if(!req.session.accessToken){
                res.render('index.ejs', { 
                    planners: undefined,
                    errors: "You need to Sign in to your 365 Account"
                })
            }
            
            let selectedTasks = []
            
            if(req.body.selectedTasks){   
                selectedTasks.push(...req.session.tasks.filter(item => req.body.selectedTasks.includes(item.id)))
            }
            

            res.render('letter.ejs', { 
                list: selectedTasks ? selectedTasks : undefined,
            })
            
        } catch (error) {
            console.log(error)
        }
    },
}

//############################################################################################
function removeCompletedTasks(taskList){
    return taskList.filter(currentTask => currentTask.completedDateTime === null)
}

function retrieveIdTitle(task){
    return {
        etag: task['@odata.etag'],
        id: task.id,
        title: task.title,
        dueDateTime: task.dueDateTime,
    }
}

function retrieveDetails(taskDetails){
    const tenantName = taskDetails.description.split("Tenant:")[1].trim()
    const taskChecklist = []

    for(const checklistitem in taskDetails.checklist){
        if(taskDetails.checklist[checklistitem].isChecked === false){
            taskChecklist.push(taskDetails.checklist[checklistitem].title.toLowerCase().trim())
        }
    }

    return {
        description: tenantName.substring(0, tenantName.indexOf('\r\n')),
        contractTerm: taskDetails.description.toLowerCase().indexOf("revision") >= 0 ? new Date(`01 ${taskDetails.description.toLowerCase().split("revision:")[1].trim()}`) : null,
        checklist: taskChecklist,
    }
}