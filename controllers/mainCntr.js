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
            const savedSettings = await Settings.findOne({ microsoftId: req.session.microsoftId })
            //console.log(req.session)
            if(savedSettings){
                //console.log(savedSettings)
                selectedPlan = {
                    planName: savedSettings.plannerName, 
                    planId: savedSettings.plannerId
                }

                const task = await graph.getAllTasks(req.session.accessToken, savedSettings.plannerId)
                const task2 = task.value.filter(currentTask => currentTask.completedDateTime === null)
                const task3 = []
                for(const currentTask of task2){
                    task3.push({
                        id: currentTask.id,
                        title: currentTask.title
                    })
                }
                
                for(const currentTask of task3){
                    const taskDetails = await graph.getDetailedTask(req.session.accessToken, currentTask.id)
                    currentTask.description = taskDetails.description
                    currentTask.checklist = []

                    for(const checklistitem in taskDetails.checklist){
                        //console.log(taskDetails.checklist[checklistitem])
                        if(taskDetails.checklist[checklistitem].isChecked === false){
                            currentTask.checklist.push(taskDetails.checklist[checklistitem].title)
                        }
                    }
                }


            }else{
                plans = await graph.getUserPlanners(req.session.accessToken, req.session.microsoftId) //gets all the planners belonging to a user
            }

            res.render('index.ejs', { 
                planners: plans ? plans[0] : undefined,
                settings: selectedPlan ? selectedPlan : undefined,
                tasks: task3 ? task3 : undefined
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
            
            //gets all the planners belonging to a user
            let plans = await graph.getUserPlanners(req.session.accessToken, req.session.microsoftId)

            //grabs all the tasks from a given planner
            const tasks = await graph.getAllTasks(req.session.accessToken, plans[0].planner[0].id)
    //console.log(tasks) //test to make sure it is grabbing the task and they are correct

            
            
            //filter the tasks by date
            let selectedDate = new Date('June 01, 2024')
    //console.log(selectedDate)
            const tasklist = []
            tasks.value.forEach(item => {
                let currentDate = new Date(item.startDateTime)
                currentDate = new Date(`${currentDate.getMonth()} ${currentDate.getDate()}, ${currentDate.getFullYear()}`)
                
                if(currentDate.getTime() < selectedDate.getTime()){
                    tasklist.push(item)
                }
            })
    //console.log(tasklist) //test to see that the tasks were filtered by date displayed
            
            //creates a list of unique names from the tasks, these tasks need to have a specific format which is: name - string
            let namelist = []
            const masterList = []
            //use namelist as a reference to the master list
            tasklist.forEach(item => {
                let currentName = item.title.split('-')[0].trim()
                let startDate = new Date(item.startDateTime)
                let endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1))
                endDate = new Date(endDate.setDate(endDate.getDate() - 1))
                

                if(!namelist.includes(currentName)){
                    namelist.push(currentName)
                    masterList.push({
                        name: currentName,
                        tenant: [
                            {
                                taskId: item.id,
                                documentList: [],
                                contractTerm: [startDate,  endDate]
                            },

                        ]
                    })
                }else{
                    masterList[namelist.indexOf(currentName)].tenant.push({
                        taskId: item.id,
                        documentList: [],
                        contractTerm: [startDate,  endDate]
                    })
                }
            })

    //console.log(namelist) //test to see that the list is displaying properly
    //console.log(masterList)

            //select specific task to grab details
            for(items of masterList){
                for(items2 of items.tenant){
                    let currentItem = await graph.getDetailedTask(req.session.accessToken, items2.taskId)
            //console.log(currentItem)
                    items2.name = currentItem.description.split(":")[1].trim()
            //console.log(items2)
                    for(item3 in currentItem.checklist){
                        items2.documentList.push(currentItem.checklist[item3].title.trim().toLowerCase())
            //console.log("tt:", currentItem.checklist[item3].title)
                    }
                }
            }
            //await graph.getDetailedTask(req.session.accessToken, taskId)
//            console.log(masterList[0].tenant)


            res.render('letter.ejs', { 
                list: masterList ? masterList : undefined,
            })
            
        } catch (error) {
            console.log(error)
        }
    },
}    