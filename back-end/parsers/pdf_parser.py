"""
PDF parsing service using LlamaParse.
"""
import re
from llama_cloud_services import LlamaParse
from utils.config import LLAMAPARSE_API_KEY


class PDFParser:
    """Service for parsing PDF documents using LlamaParse."""
    
    def __init__(self):
        self.parser = LlamaParse(
            api_key=LLAMAPARSE_API_KEY,
            num_workers=1,
            verbose=True,
            language="en",
            result_type="json",
        )

    async def extract_pdf_content(self, filename: str):
        """Extract content from PDF using LlamaParse."""
        num_tables = 0
        num_images = 0
        result = await self.parser.aparse(filename)
        json_data = {}
        
        for page in result.pages:
            page_key = "page_" + str(page.page)
            text = page.text
            text = re.sub(r"\s{2,}", " ", text)

            image_list = []
            for image in page.images:
                try:
                    image_data = await result.aget_image_data(image.name)
                    import base64
                    image_b64 = base64.b64encode(image_data).decode("utf-8")
                    image_list.append({
                        "filename": image.name,
                        "mime": "image/" + str(image.name).split(".")[-1],
                        "base64": image_b64
                    })
                    num_images += 1
                except Exception as e:
                    print(f"Failed to fetch image {image.name}: {e}")

            table_list = []
            for item in page.items:
                if item.type == "table":
                    table_list.append({"md": item.md})
                    num_tables += 1

            json_data[page_key] = {
                "text": text,
                "images": image_list,
                "tables": table_list
            }

        return json_data, num_tables, num_images
