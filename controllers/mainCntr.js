//const ewsOptions = require('../ewsConnections')
const graph = require('../graph')
const Settings = require('../models/Settings')

module.exports = { 
    index: async (req, res)=>{
        try{
            if(!req.session.accessToken){
                //status
                return res.render('index.ejs', { 
                    planners: undefined,
                    settings: undefined,
                    error: "You need to Sign in to your 365 Account"
                })
            }

            let plans

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
                let taskList = await graph.getAllTasks(req.session.accessToken, req.session.planner.planId)
                taskList = removeCompletedTasks(taskList.value)
                taskList = taskList.map(task => retrieveIdTitle(task))

                for(let i=0; i<taskList.length; i++){
                    const taskDetails = await graph.getDetailedTask(req.session.accessToken, taskList[i].id)
                    const theDetails = retrieveDetails(taskDetails)

                    taskList[i] = {...taskList[i], ...theDetails}
                }

                req.session.tasks = taskList
            }

            //status
            res.render('index.ejs', { 
                planners: plans ? plans[0] : undefined,
                settings: req.session.planner ? req.session.planner : undefined,
                tasks: req.session.tasks ? req.session.tasks : undefined
            })

        }catch(err){
            if(err.code === 'InvalidAuthenticationToken'){
                //getAccessToken(accessToken)
                console.log('InvalidAuthenticationToken index-mainCntr')

                //status
                res.render('index.ejs', { 
                    planners: undefined,
                    settings: undefined,
                    error: "You need to Sign in to your 365 Account"
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
                //status
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
                        //status
                        res.redirect('/')
                    }
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
                //status
                res.render('index.ejs', { 
                    planners: undefined,
                    error: "You need to Sign in to your 365 Account"
                })
            }
            
            let selectedTasks = []
            
            if(req.body.selectedTasks){   
                selectedTasks.push(...req.session.tasks.filter(item => req.body.selectedTasks.includes(item.id)))
            }

            //status
            res.render('letter.ejs', { 
                list: selectedTasks ? selectedTasks : undefined,
            })
            
        } catch (error) {
            console.log(error)
        }
    },

    error: async (req, res)=> {
            //status
            return res.render('index.ejs', { 
                planners: undefined,
                settings: undefined,
            })
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
    const string_norm = taskDetails.description.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    const tenantName = string_norm.split("tenant:")[1].trim()
    const taskChecklist = []

    for(const checklistitem in taskDetails.checklist){
        if(taskDetails.checklist[checklistitem].isChecked === false){
            taskChecklist.push(taskDetails.checklist[checklistitem].title.toLowerCase().trim())
        }
    }

    return {
        description: tenantName.substring(0, tenantName.indexOf('\r\n')),
        contractTerm: string_norm.indexOf("revision") >= 0 ? new Date(`01 ${string_norm.split("revision:")[1].trim()}`) : null,
        checklist: taskChecklist,
    }
}