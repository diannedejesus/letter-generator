# Planner-to-Letter

**Built by Dianne De Jesus; No current reviewers**

## Description

Select a planner and generate a letter for each tasked based on the information contained in each one.

<!-- If there is more then one task for a certain person (title) than the information of both tasks will be grouped into one letter. -->

## Functional Description

<!-- The user will open the main page which will let them select:
* letter template: dropdown list of letter views
* date range: two date selectors, range from start to end/current
* due date: date selector, only future dates
* Planner login button: opens a login window
    * once login is verified, a list of accessable planners is collected and displayed
* Button for exchange login -->

### Exchange Connection:

Exchange uses EWS and the SOAP protocal for access. This application will be using a module that will a handle the calls through JSON objects. This will be used to access the contact information stored in Exchanges outlook servers.

### MS365 Connection:

365 use an API called MSGraph to access most of the applications for 365 online. We will use this API to access and retrieve the planner information.

Once they submit the selection, the application can collect the needed data to generate the letters. First it will collect all the tasks from the desired planner, the tasks need to be formatted in the following manner for the application to interpret the data properly:

### Task Input/Format:

- Landlord Name: Title
- Tenant Name: Description
- Start date: Start date
- Documents due: Checklist

Once all the tasks are adquired we will start to create an object with all the desired information.

### build the following Object/Collection:

- landLordName: String
- tenantName: String
- initialDate: Date
- documentsDue: Array of Strings
- contractTerm: Array of Dates

Then with this we can obtain the addresses of the desired landloards and add them to this object.

### Modified Object/Collection:

- landlordName: String
- landlordAddress: Array of Strings
- tenantName: String
- initialDate: Date
- documentsDue: Array of Strings
- contractTerm: Array of Dates

Once all the data is collected it can be passed to the template view. This view will use the object to create each letter.

## Master Object Model

masterObject = [
{
name: STRING,
address: [
line1: STRING,
line2: STRING,
line2: STRING,
line2: STRING,
],
tenant: [
{
taskId: STRING
name: STRING,
documentList: [STRING, STRING, ect],
contractTerms: [startDate, endDate],
},
],
},
]

## User/Client Interface

<!--
    ### Login Page
    ![login page](https://github.com/diannedejesus/update_contacts/blob/main/login-signup.PNG?raw=true "Login Page")
    ***
    ### Signup Page
    ![signup page](https://github.com/diannedejesus/update_contacts/blob/main/signup-login.PNG?raw=true "Signup Page")
    ***
-->

## Goals and milestones

- [ ] Selection View

  - [ ] letter template: dropdown list of letter views
  - [ ] date range: two date selectors, range from start to end/current
  - [ ] due date: date selector, only future dates

  - [x] Connect to 365

    - [x] Register App on MS Identity Platform
    - [x] Setup passport to get token
    - [x] Get API handler setup
    - [x] Get account login information
    - [x] Access account

    - [x] Access correct planner
      - [x] Need a group for planner
      - [x] Access planner
    - [x] Grab the desired tasks
      - [x] Filter by date or get all tasks and filter by date inside the app
      - [x] Verify if date selection is accurate when needing exact dates

  - [x] Save task in a collection
    - [x] As is or sort out the desired info into an object
  - [x] Create a list of unique names for the tasks collected

  - [ ] Choose a module for EWS
  - [ ] Connect to exchange
    - [ ] Get account login information
    - [ ] Test connection
  - [ ] Grab contacts info (filter if possible)
    - [ ] Grab just needed info or all info and filter later
  - [ ] Remove any unneeded entries
  - [ ] Remove unneeded information
  - [ ] Return list
  - [ ] Test to see if the correct data is returned

- [x] Add tenant information to the landlord list.

  - [x] Calculate dates for the contract duration

- [ ] Cycle through the list and fill template for each landlord
- [ ] Edit planner with a due date.

Date handle:
If not an external component

- [ ] Interpret and display the date in the correct format.
- [ ] Verify if a date falls between two dates.

### Secondary Goals

- [ ] Verify why you need to login twice to adquire 365 tokens
- [ ] Fix/catch graph error when collecting planners

### Wishlist Feature

- [ ] contacts from MS365
- [ ] letter template from MSWord

<!-- #### Future



### Issues




### Completed -->
