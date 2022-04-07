//const ewsOptions = require('../ewsConnections')
const graph = require('../graph')

module.exports = { 
    index: async (req,res)=>{
        try{
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
            let selectedDate = new Date('March 01, 2022')
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
                        items2.documentList.push(currentItem.checklist[item3].title)
            //console.log("tt:", currentItem.checklist[item3].title)
                    }
                }
            }
            //await graph.getDetailedTask(req.session.accessToken, taskId)
            console.log(masterList[0].tenant)


            res.render('index.ejs', { 
                planners: plans ? plans[0] : undefined,
            })

        }catch(err){
            if(err.code === 'InvalidAuthenticationToken'){
                //getAccessToken(accessToken)
                console.log('InvalidAuthenticationToken index-mainCntr')

                res.render('index.ejs', { 
                    planners: undefined,
                    errors: "You need to Sign in to your 365 Account"
                })
              }else{
                console.log("main error:", err); // TypeError: failed to fetch
              }
            
        }
    },

    generateLetters: async (req,res)=>{
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
            let selectedDate = new Date('March 01, 2022')
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
            console.log(masterList[0].tenant)


            res.render('letter.ejs', { 
                list: masterList ? masterList : undefined,
            })
            
        } catch (error) {
            console.log(error)
        }
    },
    
    // letterView: async (req,res)=>{
    //     try{
    //         const info = await HistoricImportDB.findOne({accessLink: req.params.idCode})

    //         res.render('letter.ejs', { info, messages: req.query.messages })

    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    // verifiedList: async (req,res)=>{
    //     try{
    //         const reservationsMade = await VerifiedDataDB.find()

    //         console.log('load verified list')
    //         res.render('verifiedList.ejs', { reservations: reservationsMade })

    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    // submitList: async (req,res)=>{
    //     try{
    //         let collectedData = []
    //         const submitData = await SubmittedInformationDB.aggregate([
    //             { "$group": { 
    //               "_id": "$accessLink", 
    //               "doc": { "$first": "$$ROOT" }
    //             }},
    //             { "$replaceRoot": {
    //               "newRoot": "$doc"
    //             }}
    //         ])

    //         for(items of submitData){
    //             const linkID = items.accessLink
    //             const accessed = await NameReferenceDB.findOne({accessLink: linkID})
    //             const verified = await VerifiedDataDB.findOne({accessLink: linkID})
    //             const submits = await SubmittedInformationDB.find({accessLink: linkID}).count()
    //             collectedData.push({linkID, accessed: accessed ? accessed.accessCount : 0, verified: verified ? true : false, submits})
    //         }

    //         res.render('submitList.ejs', {submitData: submitData, collectedData })
    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    // keepAccessLinks: async (req,res)=>{
    //     try{
    //         const contactID = await SubmittedInformationDB.findOne({'accessLink': req.body.originalAccessLink})
    //         const modifyData = await SubmittedInformationDB.findOneAndUpdate({'_id': contactID._id}, {$set:{ 'accessLink': req.body.selectedAccessLink}}, { new: true })
            
    //         console.log('access link updated via keepAccessLinks')
    //         res.redirect('/dashboard/submitList')
    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    // compareData: async (req,res)=>{
    //     try{
    //         const originalData = await HistoricImportDB.findOne({accessLink: req.params.id})
    //         const submitData = await SubmittedInformationDB.find({accessLink: req.params.id})
    //         const verifiedData = await VerifiedDataDB.find({accessLink: req.params.id})

    //         //convert phones numbers to standard format
    //         let submittedNumbers = []

    //         for(let i=0; i<originalData.phones.length; i++){
    //             originalData.phones[i].number = originalData.phones[i].number.split('').filter(el => Number(el)).join('')
    //         }
        

    //         for(data of submitData){
    //             for(let i=0; i<data.phones.length; i++){
    //                 submittedNumbers.push(data.phones[i].number.split('').filter(el => Number(el)).join(''))  
    //             }
    //         }

    //         res.render('compareSubmit.ejs', { originalData: originalData, submitData: submitData, submitPhones: submittedNumbers, verifiedData: verifiedData})
    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    // import: async (req, res)=>{
    //     try{
    //         const dbFilled = await HistoricImportDB.count()

    //         if(dbFilled <= 0 && req.user.calendarEmail){
    //             const contact = await ewsOptions.getContacts(req.user.calendarPassword, req.user.calendarEmail)
    //             let collection = []

    //             for(items of contact.ResponseMessages.FindItemResponseMessage.RootFolder.Items.Contact){
    //                 if(items.JobTitle === 'Landlord'){
    //                     let currentEntry = {
    //                     name: {
    //                         firstName: items.CompleteName.FirstName,
    //                         middleInitial: items.CompleteName.MiddleName,
    //                         lastName: items.CompleteName.LastName,
    //                     },
    //                         email: items.EmailAddresses ? items.EmailAddresses.Entry[0]['$value'] : undefined,
    //                         emailUse: items.EmailAddresses ? items.EmailAddresses.Entry[0].attributes.Key === 'EmailAddress1' ? true : false : false,
    //                         phones: [],
                            
    //                         address: {
    //                             street: items.PhysicalAddresses ? items.PhysicalAddresses.Entry[0].Street : '',
    //                             city: items.PhysicalAddresses ? items.PhysicalAddresses.Entry[0].City : '',
    //                             state: items.PhysicalAddresses ? items.PhysicalAddresses.Entry[0].State : '',
    //                             zipcode: items.PhysicalAddresses ? items.PhysicalAddresses.Entry[0].PostalCode : '',
    //                         },
    //                         timestamp: new Date(),
    //                         accessLink: nanoid(10),
    //                     }
    //                     if(items.PhoneNumbers){
    //                         for(numbers of items.PhoneNumbers.Entry){
    //                             currentEntry.phones.push({
    //                                 number: numbers['$value'], 
    //                                 numberType: numbers.attributes.Key
    //                             })
    //                         }
    //                     }
    //                     collection.push(currentEntry)
    //                 }
    //             }


    //             await HistoricImportDB.insertMany(collection)
    //             .then(function (docs) {
    //                 //res.json(docs);
    //                 console.log(docs)
    //             })
    //             .catch(function (err) {
    //                 //res.status(500).send(err);
    //                 console.log(err)
    //             });

    //             await module.exports.fillReference()

    //             console.log('imported')
    //             res.redirect('/login/configure?messages=' + encodeURIComponent('Data Imported Successfully'))
    //         }else{
    //             console.log('not imported')
    //             res.redirect('/login/configure?messages=' + encodeURIComponent('Could not import data'))
    //         }
    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    // fillReference: async (req,res)=>{
    //     try{
    //         const data = await HistoricImportDB.find({}, 'name accessLink');
    //         const emptyReference = {
    //             name: {
    //                 firstName: 'empty',
    //                 middleInitial: '',
    //                 lastName: '',
    //             },
    //             accessLink: ' ',
    //         }
            
    //         console.log(data)
            
    //         NameReferenceDB.insertMany(data)
    //             .then(function (docs) {
    //                 //res.json(docs);
    //                 console.log(docs)
    //             })
    //             .catch(function (err) {
    //                 //res.status(500).send(err);
    //                 console.log(err)
    //             });
            
    //             NameReferenceDB.create(emptyReference)

    //         console.log('filled')
    //         //res.json('filled')
    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    // consolidateData: async (req, res)=>{
    //     try{
    //         const historicData = await HistoricImportDB.findOne({accessLink: req.body.accessLink});
    //         //const submitID = req.body.id ? req.body.id : ''

    //         const address = req.body.address ? req.body.address.split('$') : ''
    //         const names = req.body.fullName ? req.body.fullName.split('$') : ''
    //         const email = req.body.email ? req.body.email.split('$') : ['', false]
            
    //         const verifiedData = {
    //             name: {
    //                 firstName: names[0] ? names[0] : historicData.name.firstName,
    //                 middleInitial: names[1] ? names[1] : historicData.name.middleInitial ? historicData.name.middleInitial : '',
    //                 lastName: names[2] ? names[2] : historicData.name.lastName,
    //             },
            
    //             phones: [],
            
    //             email: email[0] ? email[0] : historicData.email,
    //             emailUse: email[1] ? email[1] : historicData.emailUse,
            
    //             address: {
    //                 street: address[0] ? address[0] : historicData.address.street,
    //                 city: address[1] ? address[1] : historicData.address.city,
    //                 state: address[2] ? address[2] : historicData.address.state,
    //                 zipcode: address[3] ? address[3] : historicData.address.zipcode,
    //             },
            
    //             accessLink: req.body.accessLink,

    //             timestamp: new Date(),
    //         }


    //         if(req.body.phoneNumber && req.body.phoneNumber.length > 0 && typeof req.body.phoneNumber !== 'string'){
    //             for(let i=0; i<req.body.phoneNumber.length; i++){
    //                 let numberInfo = req.body.phoneNumber[i].split('$')
    //                 verifiedData.phones.push({ number: numberInfo[0], numberType: numberInfo[1]})
    //             }
    //           } else if(req.body.phoneNumber){
    //             let numberInfo = req.body.phoneNumber.split('$')
    //             verifiedData.phones.push({ number: numberInfo[0], numberType: numberInfo[1]})
    //           }else{
    //             verifiedData.phones = historicData.phones
    //           }
            

    //         await VerifiedDataDB.findOneAndUpdate({accessLink: verifiedData.accessLink}, verifiedData, {
    //             new: true,
    //             upsert: true // Make this update into an upsert
    //           })
            
    //         if(typeof req.body.id !== 'string'){
    //             for(let i=0; i<req.body.id.length; i++){
    //                 //this is for changing the status or verified of submitted data
    //                 await SubmittedInformationDB.findOneAndUpdate({_id: req.body.id[i]}, {verifiedDate: new Date()})
    //             }
    //         }else{
    //             await SubmittedInformationDB.findOneAndUpdate({_id: req.body.id}, {verifiedDate: new Date()})
    //         }
            

    //         //console.log('verified', req.body.id)

    //         console.log('Data Verified')
    //         //res.json('Data Verified')
    //         res.redirect(req.get('referer'));

    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    // export end
}    