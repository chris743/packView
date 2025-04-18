import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

response = client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=300,
    temperature=0.2,
    messages=[
        {"role": "user", "content": "Write a Python function to sort a list of integers."}
    ]
)

print(response.content[0].text)
