"""
LLM service for handling MyGenAssist API calls.
"""
import requests
import base64
from io import BytesIO
from PIL import Image
from utils.config import MYGENASSIST_API_KEY, MYGENASSIST_API_URL


class LLMService:
    """Service for LLM interactions using MyGenAssist API."""
    
    def __init__(self):
        self.api_key = MYGENASSIST_API_KEY
        self.api_url = MYGENASSIST_API_URL

    def query_llm(self, prompt: str, image_b64: str = None):
        """
        Query MyGenAssist LLM with optional image.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        message_content = {"role": "user", "content": prompt}

        data = {
            "model": "gpt-4o",
            "messages": [            
                {
                    "role": "user",
                    "content": prompt,
                    "image": image_b64
                }],
            "max_tokens": 10000,
            "temperature": 0
        }

        response = requests.post(self.api_url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None

    def query_multimodal(self, image_b64: str, prompt: str):
        """
        Send image + prompt to multimodal MyGenAssist model.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                    "image": image_b64
                }
            ],
            "max_tokens": 10000,
            "temperature": 0
        }

        response = requests.post(self.api_url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None

    def generate_process_flow_description(self, process_flow_base64: str) -> str:
        """
        Convert Base64 string to image and generate description via LLM.
        """
        # Convert Base64 to bytes
        process_flow_bytes = base64.b64decode(process_flow_base64)
        image = Image.open(BytesIO(process_flow_bytes))

        # Convert back to base64 for multimodal LLM
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # Construct prompt
        prompt = "Describe the following process flow image in detail."

        # Call LLM with image
        description = self.query_multimodal(img_base64, prompt)
        return description if description else "Process flow description unavailable"
