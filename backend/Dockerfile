# Start from an official Python 3.11 image
# This is like saying "start with a clean machine that has Python 3.11"
# "slim" means a smaller version without unnecessary tools
FROM python:3.11-slim

# Set an environment variable that tells Python not to create .pyc files
# .pyc files are cached bytecode - not needed in containers
ENV PYTHONDONTWRITEBYTECODE=1

# Tell Python not to buffer output
# This means you see print() and logs immediately in the terminal
ENV PYTHONUNBUFFERED=1

# Create and move into a folder called /app inside the container
# This is where our code will live inside the container
WORKDIR /app

# Copy requirements.txt first (before copying all the code)
# Why? Docker caches layers. If requirements haven't changed,
# Docker won't re-install packages every time you rebuild.
# This makes rebuilds much faster.
COPY requirements.txt .

# Install the Python packages
RUN pip install --upgrade pip && pip install -r requirements.txt

# Now copy ALL the backend code into the container
COPY . .

# Tell Docker this container listens on port 8000
EXPOSE 8000

# The command that runs when the container starts
# This starts the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]