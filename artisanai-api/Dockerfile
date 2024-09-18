FROM python:3.12
ENV PYTHONUNBUFFERED 1

# Create a directory for the app code
RUN mkdir /src
WORKDIR /src

# Install dependencies
## We copy and install just the requirements.txt first to leverage Docker cache
COPY requirements.txt /src
RUN pip install -r requirements.txt

# Changing the code (without changing the dependencies) will not require re-installing the dependencies
# So the build will start from this point onwards

# Copy the rest of the code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "--host", "0.0.0.0", "app.main:app"]
