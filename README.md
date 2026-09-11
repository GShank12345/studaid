
Project title : Student Planning aid for humans

Description: Student Planning aid is a project designed to help students or any adult to plan their events, transactions or activities that are due in 3 days.

Dependencies: npm, typescript, zod for defining the input schema inside the tool and retrieving the current date, strands sdk, vended plugins for session, path for custom path definition,  crypto.js - for encryption and decryption AWS Lambda - for key storage , ask-sdk, /user/shared/financeaid.json for JSON file storage, express app for getting request and responses for the application invocation and health checks, steering tools in strands for prompt adherence,

Custom tool - fileViewer1, Vended tool - fileEditor

build locally - npx tsc

run the script locally - One terminal - node dist/index.js
                       - Another terminal - curl -X POST http://localhost:8080/invocations \  -H "Content-Type: application/octet-stream"

Building the app in docker - docker build -t studfin_image:latest . 

Executing the script
The script ./stdfin.sh first checks if the docker is closed or open. If closed it opens and sends a message 'waiting for the docker to open'. Once open, retrieves the json file from the mounted path (local file) and binds it to the docker path and runs the image inside the container and invokes the calls in the host 8081. The call invocations are sent to port is 8081. Once the data is transferred to the log file, the script runs commands to stop the container and then remove it.   

proper permissions to the script - chmod+x stdfin.sh
Once installed run the script - ./stdfin.sh   

Use a cron job to schedule run at a particular time -------- 00 09 * * 1-5 /Users/studaid/stdfin.sh >> /Users/cronlogs/stfinaid.log 2>&1 - runs at 9:00 AM - Monday to Friday

Modifications Include environment variables for the Lambda function for the AWS key and Secret. API Function Call - Generate API trigger for the Lambda function and include it in your Javascript application using the 'https' url to fetch.







Authors

Gomathy S totsfun@yahoo.com License

