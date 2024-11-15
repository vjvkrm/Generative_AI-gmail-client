## Work in Progress --  please keep checking for updates as many new features will be coming soon. 

Contributions are welcome! Help us enhance existing features and bring exciting new ones to life.

## GenAI Email Client for Gmail

A modern TypeScript-based Gmail client built on Express.js with full OAuth2 support. ( A simple static html dashboard is included ) - A full-featured front-end interface is planned for future development.

This application allows users to manage their Gmail account through a simple web interface. It integrates with OpenAI's model to provide AI-generated email replies and analyses.

## Features

- Connect to Gmail using OAuth2 authentication
- View emails
- Compose and send emails
- Reply with AI-generated suggestions
- Analyze emails for importance and summarization
- Delete emails
- More features coming soon....

## Prerequisites

- Node.js >= 18.0.0
- npm (Node Package Manager)
- Google Cloud project with OAuth 2.0 credentials
- OpenAI API key

## Installation

clone the repo

cd Generative_AI-gmail-client

npm install

npm run dev

 Important: add your email which you want to connect as test email in google cloud project when running app locally .

## LocalHost : user Loging. 
<img width="869" alt="Screenshot 2024-11-15 at 09 53 01" src="https://github.com/user-attachments/assets/13fd7504-de46-4c89-bf01-f90450b7e86b">



## Choose your email account to sync 
<img width="861" alt="Screenshot 2024-11-15 at 09 53 15" src="https://github.com/user-attachments/assets/a966ac41-5a1f-4e33-b48c-f23a896dc47a">

## Once connected you will be on main dashboard ,   during loading you may see something like below image when app is performing AI actions over emails to categorize and summary

<img width="756" alt="Screenshot 2024-11-15 at 09 53 46" src="https://github.com/user-attachments/assets/835b22e7-10bf-4cb9-8843-b6002ab28809">


 AI Info  =>  
### AI scans emails and flags as Important - if deemed important
### AI scans and generate categorisation.
### AI generates a one liner summary of your email
 
<img width="1297" alt="Screenshot 2024-11-15 at 09 45 38" src="https://github.com/user-attachments/assets/611d8f9d-18b4-4d55-a5b8-2ec9d24fdb7e">

### On clicking email user can read original email.
<img width="1266" alt="Screenshot 2024-11-15 at 09 46 07" src="https://github.com/user-attachments/assets/dd2377b7-ab28-4811-b61f-3e8d2e52b7c8">

### On clicking Reply AI will auto generate Reply , that can be edited or sent directly. 
<img width="1299" alt="Screenshot 2024-11-15 at 09 46 34" src="https://github.com/user-attachments/assets/2aba9c9c-737c-48d4-b7cf-ce976a57d518">




