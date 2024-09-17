# ArtisanAI Chatbot MVP 🤖

This project is an MVP for the ArtisanAI chatbot product. The main goal is to validate the UI/UX and gather user feedback.

## Features ✨

- Send messages
- Edit a message
- Delete a message

## Business decisions 💼

- Users will interact with the chatbot during a single session, and there will be no access to a chat history.
- Users are only able to edit/delete the last not-deleted message in the chat. This will avoid confusion if looking at fragments of a history.
- Data persistence is not included in the MVP stage.

## Running 

### Dev/Local
- The instructions to run the backend and frontend are located in the respective directories README.md files: `artisanai-api/README.md` and `artisanai-chat-widget/README.md`

## Next Steps 🚀

- Generate replies using a real AI model.
    - Integrate the ChatbotService with an AI provider using Langchain to explore and find the best fit for our product.
- Implement data persistence.
    - Store chat data in columnar ORC format in the S3 standard tier.
    - Create a lifecycle rule so that once analyzed, the data moves to Infrequent Access tier so we minimize costs.
- Integrate the auth middleware with the company's authentication backend.
- Add E2E testing with Cypress + Cucumber.
- Add a "give feedback" button to collect engaged users' feedback.

Let's make the ArtisanAI chatbot even better! 😊
