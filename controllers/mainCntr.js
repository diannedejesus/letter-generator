//const ewsOptions = require('../ewsConnections')
const graph = require('../graph')
const Settings = require('../models/Settings')

module.exports = { 
    index: async (req, res)=>{
        try{
            if(!req.session.accessToken){
                return res.render('index.ejs', { 
                    planners: undefined,
                    settings: undefined
                })
            }

            let selectedPlan, plans
            let task3
            const savedSettings = await Settings.findOne({ microsoftId: req.session.microsoftId })

            if(savedSettings){
                selectedPlan = {
                    planName: savedSettings.plannerName, 
                    planId: savedSettings.plannerId
                }

                let taskList = await graph.getAllTasks(req.session.accessToken, savedSettings.plannerId)
                taskList = removeCompletedTasks(taskList.value)
                filteredTaskList = getIdTitle(taskList)
                
                for(const currentTask of filteredTaskList){
                    const taskDetails = await graph.getDetailedTask(req.session.accessToken, currentTask.id)
                    currentTask.description = taskDetails.description
                    currentTask.checklist = []

                    for(const checklistitem in taskDetails.checklist){
                        if(taskDetails.checklist[checklistitem].isChecked === false){
                            currentTask.checklist.push(taskDetails.checklist[checklistitem].title.toLowerCase().trim())
                        }
                    }
                }


            }else{
                plans = await graph.getUserPlanners(req.session.accessToken, req.session.microsoftId) //gets all the planners belonging to a user
            }

            res.render('index.ejs', { 
                planners: plans ? plans[0] : undefined,
                settings: selectedPlan ? selectedPlan : undefined,
                tasks: filteredTaskList ? filteredTaskList : undefined
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
                })
            }
            
            let selectedTasks = []
            //get task info
            for(const currentId of req.body.selectedTasks){
                const currentTask = await graph.getSingleTask(req.session.accessToken, currentId)
                selectedTasks.push({
                    id: currentTask.id,
                    title: currentTask.title,
                    dueDateTime: currentTask.dueDateTime,
                    contractTerm: new Date(Date.now()),
                })
            }

            //get taskdetails
            for(const currentTask of selectedTasks){
                const taskDetails = await graph.getDetailedTask(req.session.accessToken, currentTask.id)
                currentTask.description = taskDetails.description.split("Tenant:")[1].trim()
                currentTask.checklist = []

                for(const checklistitem in taskDetails.checklist){
                    if(taskDetails.checklist[checklistitem].isChecked === false){
                        currentTask.checklist.push(taskDetails.checklist[checklistitem].title.toLowerCase().trim())
                    }
                }
            }

            //console.log(selectedTasks)

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

function getIdTitle(taskList){
    const newList = []

    for(const currentTask of taskList){
        newList.push({
            id: currentTask.id,
            title: currentTask.title
        })
    }

    return newList
}