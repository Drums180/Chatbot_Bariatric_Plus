const OpenAI = require("openai").default;
const dotenv = require("dotenv");
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function fetchChatGPTResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a bariatric doctor" },
        { role: "user", content: prompt },
      ],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching response from OpenAI:", error);
    return "Sorry, I couldn't process your request.";
  }
}

module.exports = { fetchChatGPTResponse };
