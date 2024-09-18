# Artisan Chatbot Frontend Module
This is the frontend module of the Artisan Chatbot


## Installation

### Source code
1. Clone the repository
2. Navigate to the frontend module's directory
    ```shell
    cd artisanai-test/artisanai-chat-widget
    ```

3. Install depdencies\
    This step is needed only once
    ```shell
    npm i
    ```

4. Update your environment
    * Copy the file `artisanai-chat-widget/.env` to `artisanai-chat-widget/.env.local`

    * Set the REACT_APP_API_URL to what works for you, http://localhost:8000 if you're running the backend as well

5. Start the server in dev mode
    ```shell
    npm start
    ```

This runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.


## Contributing

We welcome contributions!\
Please be mindful of the following guidelines:

### Code style
* Leverage bootstrap-react components instead of pure html components with bootstrap styles
* Import only what you will use

### Code quality
We ensure code quality through code linting and (soon) testing

* Linting

    We use `eslint` as our linter of choice.\
    Running in dev mode will execute eslint after every reload so *watch out for the console*.

* Testing

    Testing isn't implemented yet.

    The suggested approach is to perform end-to-end (E2E) testing in the frontend module, pointing to a non-production environment.

    Also, the recommendation is to use a testing framework such as Cypress, leveraging the most of modern testing tools.

### To-do

- Implement a button to collect feedback.
- Implement authentication pages.
- Intercept and inject an Autorization header.
