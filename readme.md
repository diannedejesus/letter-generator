# Planner-to-Letter
**Built by Dianne De Jesus; No current reviewers**
  
## Description
Select a planner and generate a letter for each tasked based on the information contained in each one. If there is more then one task for a certain person (title) than the information of both tasks will be grouped into one letter.

<!-- Functional Descrition
 With this section, you’re trying to answer a simple question: What does the software do? Of course, to answer this question thoroughly, you’ll need to dig a little deeper. In your functional description, you should cover error handling, one-time startup procedures, user limitations, and other similar details.  -->

## Functional Description
The user will open the main page which will let them select: 
* letter template: dropdown list of letter views
* date range: two date selectors, range from start to end/current
* due date: date selector, only future dates
* Planner login button: opens a login window
    * once login is verified, a list of accessable planners is collected and displayed
* Button for exchange login

### Exchange Connection:
Exchange uses EWS and the SOAP protocal for access. This application will be using a module that will a handle the calls through JSON objects. This will be used to access the contact information stored in Exchanges outlook servers.

### MS365 Connection:
365 use an API called MSGraph to access most of the applications for 365 online. We will use this API to access and retrieve the planner information.

Once they submit the selection, the application can collect the needed data to generate the letters. First it will collect all the tasks from the desired planner, the tasks need to be formatted in the following manner for the application to interpret the data properly:

### Task Input/Format:
* Landlord Name: Title
* Tenant Name: Description
* Start date: Start date
* Documents due: Checklist

Once all the tasks are adquired we will start to create an object with all the desired information. 

### build the following Object/Collection:
* landLordName: String
* tenantName: String
* initialDate: Date
* documentsDue: Array of Strings
* contractTerm: Array of Dates

Then with this we can obtain the addresses of the desired landloards and add them to this object.

### Modified Object/Collection:
* landlordName: String
* landlordAddress: Array of Strings
* tenantName: String
* initialDate: Date
* documentsDue: Array of Strings
* contractTerm: Array of Dates

Once all the data is collected it can be passed to the template view. This view will use the object to create each letter.





<!-- ### Databases


 -->





## User/Client Interface
<!-- 
    ### Login Page
    ![login page](https://github.com/diannedejesus/update_contacts/blob/main/login-signup.PNG?raw=true "Login Page")
    ***
    ### Signup Page
    ![signup page](https://github.com/diannedejesus/update_contacts/blob/main/signup-login.PNG?raw=true "Signup Page")
    ***
-->

<!-- User Interfase
There’s a good chance your coding project is going to be an application, which means it will have a user interface. (If your project is a library or something similar, there won’t be an interface.) As clients, UX designers, and programmers discuss and plan the user interface, it’s easy for the lines to get crossed. If the client doesn’t adequately communicate their vision, your teams might build out the user interface only to have the design shot down.  

Here’s the good news: These mishaps are, for the most part, entirely avoidable. You just need to discuss a few questions with the client before you start developing. Do certain elements of the interface change (animations)? Which elements are buttons? How many unique screens can the user navigate to? And, of course, what does all of this actually look like?

And there’s more good news: Wireframe diagrams can help you answer all of these questions! As your client shares their vision for the user interface (perhaps sending rough sketches), your teams should build out wireframe diagrams.

Once these wireframes are approved by the client, include them in the user interface section of your software design document.

illustration of people working together
Learn how to create a low-fidelity wireframe in Lucidchart to include within your software design document. -->

## Goals and milestones
- [ ] Selection View
    - [ ] letter template: dropdown list of letter views
    - [ ] date range: two date selectors, range from start to end/current
    - [ ] due date: date selector, only future dates

    - [ ] Connect to 365
        - [X] Register App on MS Identity Platform
        - [X] Setup passport to get token
        - [ ] Get API handler setup
        - [X] Get account login information
        - [ ] Access account

        - [ ] Access correct planner
            - [ ] Need a group for planner
            - [ ] Access planner
        - [ ] Grab the desired tasks
            - [ ] Filter by date or get all tasks and filter by date inside the app

    - [ ] Save task in a collection
    - [ ] As is or sort out the desired info unto an object
    - [ ] Create a list of unique names for the tasks collected
    - [ ] Verify each one


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


- [ ] Add tenant information to the landlord list.
    - [ ] Calculate dates for the contract duration
- [ ] Verify



- [ ] Cycle through the list and fill template for each landlord
- [ ] Edit planner with a due date.

Date handle:
If not an external component

- [ ] Interpret and display the date in the correct format.
- [ ] Verify if a date falls between two dates.



### Secondary Goals




### Wishlist Feature
- [ ] contacts from MS365
- [ ] letter template from MSWord


<!-- #### Future



### Issues




### Completed -->






<!-- NOTES



 -->

<!-- Break it down
 Instead of approaching your project as a single drawn-out process, you might find it helpful to break it down into more manageable pieces. (This is true for the project’s timeline and the code itself.) At the most macro level, you have an overarching goal: What problem is your software addressing? Who will be using it?

Below that, you have a set of milestones. Milestones are essentially checkpoints—they help stakeholders know when certain aspects of the project will be completed. These milestones are for both internal use and external use. Within your team, they help keep your engineering team on track. You can also use them to show the client measurable steps your teams are taking to finish the project.  -->

<!-- ## Prioritization
As you begin to break the project into smaller features and user stories, you’ll want to rank them according to priority. To do this, plot each feature on a prioritization matrix, a four-quadrant graph that helps you sort features according to urgency and impact. The horizontal axis runs from low to high urgency; the vertical axis runs from low to high impact.

Based on the quadrant each feature falls into, decide whether to include it in your minimum viable product (MVP). Features in the upper-right quadrant (high urgency, high impact) should be included in your MVP. With features in the bottom-right (high urgency, low impact) and upper-left (low urgency, high impact) quadrants, use your discretion to decide if they are a part of your MVP. Features in the bottom-left quadrant (low urgency, low impact) should not be included in your minimum viable product.
-->

<!-- ## Current and proposed solutions 
You’re building software to address a problem, but yours might not be the first attempt at a solution. There’s a good chance a current (or existing) solution is in place—you’ll want to describe this solution in your SDD. 

You don’t need to get into the tiny details, but should at least write up a user story: How does a user interact with that solution? How is data handled?

Next, you’ll want to include a section outlining your proposed solution. If there’s an existing solution in place, why is your proposed solution needed? Now’s your chance to justify the project. You’ll want to explain this in as much technical detail as possible—after reading this section, another engineer should be able to build your proposed solution, or something like it, without any prior knowledge of the project.
-->

<!-- ## Timeline
The milestones section of your SDD should provide a general timeframe for non-engineering stakeholders. This section is far more detailed and is mostly for the benefit of your engineering teams. In your timeline, include specific tasks and deadlines as well as the teams or individuals to which they’re assigned.  -->

<!--  -->
<!-- Pro tips for creating your software design documents
Just because you create a software design document and include each of the aforementioned sections doesn’t mean it’ll be effective. It’s a start, sure, but to get the most from your SDDs, keep these tips in mind. -->

<!-- Keep your language simple
When it comes to software design documents, clarity is key. There’s no need for flowery language and long, winding sentences—keep your sentences short and precise. Where appropriate, include bullet points or numbered lists. -->

<!-- Include visuals
Think back to your user interface section. Using wireframes, you’re able to accurately communicate a design that would be nearly impossible to describe in writing. You might find class diagrams, timelines, and other charts similarly useful throughout your SDD.  -->

<!-- Get feedback early
Your first draft of an SDD doesn’t necessarily need to be your last—it should be one of many. As you create a software design document for your project, send it to the client and other stakeholders. They might catch sections that need to be fleshed out or parts that are unclear that you missed. Once you’ve gotten their feedback, revise, revise, revise! -->

<!-- Update your SDD
Once you’ve written your software design document and gotten approval from stakeholders, don’t lock it away in some dusty drawer (or whatever the digital equivalent is). As your project progresses, team members should be referencing the SDD constantly. If there’s a delay, update your timeline. By treating an SDD as a living document, it will become an invaluable single source of truth. -->

<!-- 
------------- Look in to ------------------

-->
