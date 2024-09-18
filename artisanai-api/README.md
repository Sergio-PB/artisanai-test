# Artisan Chatbot Backend Module
This is the backend module of the Artisan Chatbot


## Installation

### Docker 🐳
You can run the API from our stable docker image.\
Assuming you have your `docker` setup and running, execute:
```shell
docker run --rm --name artisanai-api -p 8000:8000 sergiopb/artisanai-api
```

And access the API on http://localhost:8000/docs

See our oficial image in https://hub.docker.com/r/sergiopb/artisanai-api

### Source code 💻
1. Clone the repository
2. Navigate to the project directory
    ```shell
    cd artisanai-test/artisanai-api
    ```

3. Active your virtual environment
    
    3.a Create an environment

    This step is needed only once
    ```shell
    python3 -m venv venv
    ```

    3.b Activate it
    ```shell
    . ./venv/bin/activate
    ```

3. Install the required dependencies by running the following command:
    ```shell
    python3 -m pip install -r requirements.txt
    ```

4. Start the server by running the following command:
    ```shell
    uvicorn app.main:app --reload
    ```

5. Access the API on http://localhost:8000/docs

### Building a Docker image 💻 + 🐳
1. Clone the repository
2. Navigate to the project directory
    ```shell
    cd artisanai-test/artisanai-api
    ```

3. Build the backend image with:
    ```shell
    docker build -t artisanai-api:latest .
    ```

4. Run the image:
    ```shell
    docker run --rm --name artisanai-api -p 8000:8000 artisanai-api
    ```

5. Access the API on http://localhost:8000/docs

## Contributing

We welcome contributions!
Please be mindful of the following guidelines:

### Code style
* Adhere to PEP-8 and you should be fine

### Code quality
We ensure code quality through code linting and testing

* Linting

    We use `ruff` as our linter of choice.
    See `ruff.toml` for the linter settings
    Befure submiting changes, run from the `artisanai-api` directory:
    ```shell
    ruff check .
    ```

* Testing

    Aim for 100% LoC coverage with unit tests.

    E2E testing is done from the frontend application.

    Run unit tests with:
    ```shell
    coverage run -m unittest discover -s tests
    ```

    which generates a coverage report, which you see with:
    ```shell
    coverage report -m
    ```

    Alternatively, run both with:
    ```shell
    coverage run -m unittest discover -s tests; coverage report -m
    ```
