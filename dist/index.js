import { BedrockClient } from "@aws-sdk/client-bedrock";
import { BedrockModel } from "@strands-agents/sdk/models/bedrock";
import { date, z } from "zod";
import CryptoJS from "crypto-js";
import { promises as fs } from "fs";
import { fileEditor } from "@strands-agents/sdk/vended-tools/file-editor";
import express, { response } from "express";
import { LocalFileStorage } from '@strands-agents/sdk/storage';
import { Agent, Message, SessionManager, tool } from '@strands-agents/sdk';
import { ContextOffloader } from "@strands-agents/sdk/vended-plugins";
import * as path from "path";
var result;
var awskey1 = "";
var awskey2 = "";
const PORT = 8081;
const minlin = 3;
var modelid = 'nova';
const REGION = "us-east-1";
var s3url = "";
var s4url = "";
const dateSchema = z.coerce.date();
const validDate = new Date();
const date3 = dateSchema.parse(validDate);
console.log("date3===================", date3);
const client = new BedrockClient({ region: REGION });
const filenm = '/app/data/financeaid.json';
const iv = CryptoJS.enc.Utf8.parse("");
var awsurl = "https://2d6fcanvsxi2u656q5r4xiinfe0azoqk.lambda-url.us-east-1.on.aws/";
const app = express();
export const main = async () => {
    /************credentials */
    //////*************** Agent management */
    const storage = new LocalFileStorage('./stfinaid/studfin.json');
    //  const storage = new InMemoryStorage()
    const fileViewer1 = tool({
        name: 'fileViewer1',
        description: 'Get the path of the file, and show the response. ',
        inputSchema: z.object({
            path: z.string(`${filenm}`).describe('Asolute path of the file'),
            file_text: z.string(`${storage}`).optional().describe("File name of the new file"),
            // file_response: z.string("Success").describe('The file response')
        }),
        callback: async (input) => {
            console.log(`inside file viewer==========================${input.path}`);
            try {
                //   console.log("inside file reader================================",context)
                //  if (!context) {
                //  console.log("Tool context is required.")
                //   result = "Tool context is required."
                //   }
                const stats = await fs.stat(input.path).then(() => true).catch(() => false);
                const fexists = await fs.access(input.path).then(() => true).catch(() => false);
                console.log(`inside file stats and exists==========================${stats}======${fexists}`);
                //  const fileReader =  await fs.readFile(input.path,'utf-8')
                if (!path.isAbsolute(input.path)) {
                    console.log(`The ${input.path} is not absolute`);
                    result = { success: false, message1: `The ${input.path} is not absolute ` };
                    return result;
                }
                // console.log("exists ================================",fexists)
                else if (fexists == false) {
                    console.log(`The ${input.path} does not exist.`);
                    result = { success: fexists, message1: `The ${input.path} does not exist.` };
                    return result;
                }
                else if (stats == false) {
                    console.log(`The ${input.path} is a directory`);
                    result = { success: stats, message1: `The ${input.path} is a directory.` };
                    return result;
                }
                else if (stats == true) {
                    console.log("Inside =============== stats " + (input.path).toLowerCase().endsWith(".json") + ' ' + (input.path).toLowerCase().endsWith("json"));
                    if ((input.path).toLowerCase().endsWith("json") == false) {
                        console.log(`The path is not not a valid file name`);
                        result = { success: false, message1: `The file does not exist at ${input.path} ` };
                        return result;
                    }
                    else {
                        const fileReader = await fs.readFile(input.path, 'utf-8');
                        const text = fileReader.split('\n');
                        const numlin = text.length;
                        if (numlin < 1. || numlin < minlin) {
                            result = { success: false, message1: `The file in the path ${input.path} is not valid or there is no file` };
                            return result;
                        }
                        else {
                            result = { success: true, message1: `Go through the file and get valid activities and transactions and store with a file name - stfaid + ${date3}.` };
                            return result;
                        }
                    }
                }
            }
            catch (error) {
                console.log("The error is ======================================", error);
                result = { success: false, message1: `${error}` };
                return result;
            }
        }
    });
    const session = new SessionManager({
        sessionId: 'support-session',
        storage: storage
    });
    try {
        const resp = await fetch(awsurl);
        const data2 = await resp.json();
        if (data2.val1 != undefined) {
            //  console.log("Inside ================",)
            awskey1 = CryptoJS.AES.decrypt(data2.val1, "", {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
        }
        if (data2.val2 != undefined) {
            awskey2 = CryptoJS.AES.decrypt(data2.val2, "", {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
        }
    }
    catch (error) {
        console.log("Unable to get AWS Credentials", error);
    }
    //////*************** Agent management */
    await session.deleteSession();
    console.log("inside client");
    const bedrockModel = new BedrockModel({
        modelId: "amazon.nova-lite-v1:0",
        clientConfig: {
            credentials: {
                accessKeyId: awskey1,
                secretAccessKey: awskey2
            }
        },
        // cacheConfig: {. // Nova lite does not support
        //  strategy: "auto"
        // },
        region: 'us-east-1',
        guardrailConfig: {
            guardrailIdentifier: 'arn:aws:bedrock:us-east-1:081669677435:guardrail/jbwrokjdhx88',
            guardrailVersion: 'DRAFT',
            trace: 'enabled',
            streamProcessingMode: 'sync',
            guardLatestUserMessage: true
        },
        temperature: 0.3,
        topP: 0.8,
    });
    // console.log(`model name is ${model.modelName}`)
    const agent = new Agent({ model: bedrockModel,
        //   tools: [supportTicTool, supportTicTool1],
        tools: [fileViewer1, fileEditor],
        // systemPrompt: "You are a helpful weather tool that shows current weather conditions from National weather services API by calling httpRequest tool and sending in the zip code based on the system location. Highlight the temperature, UV Index and current weather conditions such as 'sunny','raining', or 'snowing'. Also make recomendations based on the forecast for the next 6 hours. ",
        systemPrompt: "You are a helpful alert tool that gets information from the JSON file. Use the 'fileViewer1' custom tool to check if the file exists in the specific path, if not use the messages in the 'fileViewer1' tool to show the results. If the file exists, then read the contents of the JSON file and get all the financial transactions with an open status. Then, compare the Date in the 'fileEditor' tool to today's date and alert all the transactions that are due in 3 days. First, the month and the year from the Date in the tool must match the today's month and year. Then, get the date from the Date in the tool and compare with today's date. If the difference in today's date and the tool Date is less than 3 then show the results. If there is no match say that there is none. Use simple English to show the results. ",
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "guardContent": {
                            "text": {
                                "text": `If the response.success is false from the \' fileViewer1 \'. Use response.message from the tool and show the same response. If the file exists with response.success as true in the \' fileViewer1 \' tool then proceed to \' fileReader \' tool`,
                                "qualifiers": ["guard_content"]
                            }
                        }
                    },
                    {
                        "guardContent": {
                            "text": {
                                "text": `Retrieve the month and year from the Date in the \' fileViewer1 \' tool and match it with the month and year of today\'s date in \' fileReader \' tool, if it matches then if the day in the custom tool is 3 less than the day in the vended tool, then only display the contents. `,
                                "qualifiers": ["guard_content"]
                            }
                        }
                    },
                    {
                        "guardContent": {
                            "text": {
                                "text": "Display transactions or activities that need to be completed immediately.",
                                "qualifiers": ["query"]
                            },
                        }
                    }
                ]
            }
        ],
        toolExecutor: "sequential",
        plugins: [new ContextOffloader({ storage }), session],
    });
    setTimeout(() => agent.cancel(), 40_000);
    // const agent = new Agent()
    // Health check endpoint (REQUIRED)
    app.get('/ping', (req, res) => res.json({
        status: 'Healthy',
        time_of_last_update: Math.floor(Date.now() / 1000),
    }));
    async function processStreamingResponse() {
        //  const response1 = await agent.invoke("What is the current weather in North Carolina?")
        //  const prompt = "What is the current weather in North Carolina?"
        //  for await (const event of agent.stream(prompt)) {
        app.post('/invocations', express.raw({ type: '*/*' }), async (req, res) => {
            try {
                const prompt = `First use \'fileViewer1 \' tool to check if ${filenm} exists. If there is no error message from \'fileViewer1 \' tool, then proceed to \' fileReader \' tool and read all the lines of the file in the path ${filenm}. Display all the transactions that need to be completed immediately. Today\'s date is ` + date3;
                // const resp = await agent.invoke(req.body = prompt,{
                const resp = await agent.invoke(req.body = prompt, {
                    // const resp = agent.invoke(new TextDecoder().decode(req.body), {
                    limits: {
                        turns: 6,
                        outputTokens: 3000,
                        totalTokens: 10000,
                    },
                });
                // console.log("The agent resp =========================",resp.toString())
                if ((await resp).stopReason === 'cancelled') {
                    console.log("Agent was cancelled due to time out");
                }
                return res.json(JSON.stringify(resp, null, 2));
            }
            catch (err) {
                console.error("Internal server error", err);
                // return res.status(500).json({error:'Internal Server Error'})
            }
        });
    } // end of process streaming
    await processStreamingResponse();
    // return response;
    // })
    // })
};
main();
// Start server
app.listen(PORT, async () => {
    console.log(`🚀 AgentCore Runtime server listening on port ${PORT}`);
    console.log(`📍 Endpoints:`);
    console.log(`   POST http://0.0.0.0:${PORT}/invocations`);
    console.log(`   GET  http://0.0.0.0:${PORT}/ping`);
});
//# sourceMappingURL=index.js.map