//const ewsOptions = require('../ewsConnections')
const graph = require('../graph')
const Settings = require('../models/Settings')
//const refreshAccessToken =  require('../config/refreshToken');

module.exports = { 
    index: async (req, res)=>{
        try{
            if(!req.session.accessToken){
                //error status
                return res.render('index.ejs', { 
                    planners: undefined,
                    settings: undefined,
                    error: "You need to Sign in to your 365 Account"
                })
            }

            graph.init(req.session.accessToken);

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
                let taskList = await graph.getAllTasks(req.session.planner.planId)

                if(taskList){
                    let planInfo = await graph.getPlannerDetails(req.session.planner.planId)
                    let currentLabels = []

                    taskList.value.forEach(task => {
                        currentLabels.push(...Object.keys(task.appliedCategories))
                    })

                    currentLabels = [...new Set(currentLabels)]
                    if(planInfo){
                        let filterList = {}
                        
                        for(const label in planInfo.categoryDescriptions){
                            if(currentLabels.includes(label)){
                                filterList[label] = planInfo.categoryDescriptions[label]
                            }
                        }

                        req.session.planLabelNames = filterList
                        
                    }
                    //currentLabels = currentLabels.map(label => planInfo.categoryDescriptions[label] ? planInfo.categoryDescriptions[label] : label)
                    //req.session.planLabelNames = currentLabels 

                    taskList = removeCompletedTasks(taskList.value)
                    taskList = taskList.map(task => retrieveIdTitle(task))
    
                    for(let i=0; i<taskList.length; i++){
                        const taskDetails = await graph.getDetailedTask(taskList[i].id)
                        const theDetails = retrieveDetails(taskDetails)
    
                        taskList[i] = {...taskList[i], ...theDetails}
                    }

                    req.session.tasks = taskList
                }
            }
            //console.log(req.session.tasks)
            //status
            res.render('index.ejs', { 
                planners: plans ? plans[0] : undefined,
                settings: req.session.planner ? req.session.planner : undefined,
                tasks: req.session.tasks ? req.session.tasks : undefined,
                planLabels: req.session.planLabelNames
            })

        }catch(err){
            if(err.code === 'InvalidAuthenticationToken'){
                //await refreshToken()
                console.log('InvalidAuthenticationToken index-mainCntr')

                //error status
                res.render('index.ejs', { 
                    planners: undefined,
                    settings: undefined,
                    error: "You need to Sign in to your 365 Account"
                })
            }else{
                console.log("main error:", err); // TypeError: failed to fetch
                //error status
                res.render('index.ejs', { 
                    planners: undefined,
                    settings: undefined,
                    error: "An error occurred in main index"
                })
            }
        }
    },

    setPlan: async (req, res)=>{
        try {
            if(!req.body || !req.body.plan){
                console.log("No values found.")
                //error status
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

    filterTasks: async (req, res)=>{
        if(!req.params || !req.params.label){
            console.log("No values found.")
            //error status
            res.redirect('/')
        }
        console.log(req.params.label)
        for(const task of req.session.tasks){
            console.log(task)
            console.log(task.labels ? task.labels.includes(req.params.label) : "No labels")
        }

        let filterTasks = req.session.tasks.filter(task => task.labels.includes(req.params.label))
//console.log(filterTasks)


        res.render('index.ejs', { 
            //planners: plans ? plans[0] : undefined,
            settings: req.session.planner ? req.session.planner : undefined,
            tasks: filterTasks ? filterTasks : req.session.tasks ? req.session.tasks : undefined,
            planLabels: req.session.planLabelNames
        })
    },

    generateLetters: async (req, res)=>{
        try {        
            if(!req.session.accessToken){
                //error status
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
    let labelList = []

    for(const label in task.appliedCategories){
        if(task.appliedCategories[label]){
            labelList.push(label)
        }
    }

    return {
        etag: task['@odata.etag'],
        id: task.id,
        title: task.title,
        dueDateTime: task.dueDateTime,
        labels: labelList,
    }
}

function retrieveDetails(taskDetails){
    const string_norm = taskDetails.description.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    const tenantName = string_norm.split("tenant:")[1].trim()
    const tenantRevision = string_norm.indexOf("revision") >= 0 ? string_norm.split("revision:")[1].trim() : null;
    const taskChecklist = []

    let newDate = new Date(`01 ${tenantRevision}`);
    newDate.setFullYear(newDate.getFullYear() + 1); //needs to go first to account for leap year
    newDate.setDate(newDate.getDate() - 1);
    
    

    for(const checklistitem in taskDetails.checklist){
        if(taskDetails.checklist[checklistitem].isChecked === false){
            taskChecklist.push(taskDetails.checklist[checklistitem].title.toLowerCase().trim())
        }
    }

    return {
        description: tenantName.substring(0, tenantName.indexOf('\r\n')),
        contractTerm: tenantRevision ? new Date(`01 ${tenantRevision}`) : null,
        contractTerm_end: tenantRevision ? newDate : null,
        checklist: taskChecklist,
    }
}