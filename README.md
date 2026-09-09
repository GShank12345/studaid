
Project title : Student Planning aid for humans

Description: Student Planning aid is a project designed to help students or any adult to plan their events, transactions or activities that are due in 3 days.

Dependencies: typescript, zod for defining the input schema inside the tool and retrieving the current date, strands sdk, vended plugins for session, path for custom path definition,  crypto.js - for encryption and decryption AWS Lambda - for key storage , ask-sdk, /user/shared/financeaid.json for JSON file storage

Custom tool - fileViewer1, Vended tool - fileEditor

Building the docker file - docker build -t studfin_image:latest . 
Installs The application.

Executing program

Once installed run the script - ./stdfin.sh   

Use a cron job to schedule run at a particular time -------- 00 09 * * 1-5 /Users/studaid/stdfin.sh >> /Users/cronlogs/stfinaid.log 2>&1 - runs at 9:00 AM - Monday to Friday

Modifications Include environment variables for the Lambda function for the OpenAI key. API Function Call - Generate API trigger for the Lambda function and include it in your Javascript application using the 'https' url to fetch.







Authors

Gomathy Shankaran totsfun@yahoo.com License

