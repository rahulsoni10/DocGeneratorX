import re
from llama_cloud_services import LlamaParse
from dotenv import load_dotenv
import base64
import os
import asyncio
import json
import pandas as pd
from io import StringIO

load_dotenv()

async def extract_pdf_llamaparse(filename: str):
    parser = LlamaParse(
        api_key=os.getenv("LLAMAPARSE_API_KEY"),
        num_workers=1,
        verbose=True,
        language="en",
        result_type="json",
    )
    num_tables = 0
    num_images = 0
    result = await parser.aparse(filename)
    json_data = {}
    for page in result.pages:
        page_key = "page_" + str(page.page)
        text = page.text
        text = re.sub(r"\s{2,}", " ", text)

        image_list = []
        for image in page.images:
            try:
                image_data = await result.aget_image_data(image.name)
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

# ✅ Save Logic (added after your original code)
def save_output(json_data):
    output_dir = "/workspaces/Agentic_Pharma/back-end/output"
    images_dir = os.path.join(output_dir, "images")
    tables_dir = os.path.join(output_dir, "tables")
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(tables_dir, exist_ok=True)

    # Save JSON dump
    with open(os.path.join(output_dir, "output.json"), "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)

    for page_key, content in json_data.items():
        page_num = page_key.split("_")[1]

        # Save images
        for idx, img in enumerate(content["images"], start=1):
            ext = img["filename"].split(".")[-1]
            img_bytes = base64.b64decode(img["base64"])
            image_path = os.path.join(images_dir, f"page_{page_num}_image_{idx}.{ext}")
            with open(image_path, "wb") as f:
                f.write(img_bytes)

        # Save tables
        for idx, tbl in enumerate(content["tables"], start=1):
            try:
                df = pd.read_csv(StringIO(tbl["md"]), sep="|", engine="python", skipinitialspace=True)
                df = df.loc[:, ~df.columns.str.contains('^Unnamed')]  # remove markdown border columns
                table_path = os.path.join(tables_dir, f"page_{page_num}_table_{idx}.xlsx")
                df.to_excel(table_path, index=False)
            except Exception as e:
                print(f"❌ Failed to save table on page {page_num}, table {idx}: {e}")

if __name__ == "__main__":
    pdf_path = r"/workspaces/Agentic_Pharma/back-end/filled_templates/template1.pdf"
    data, num_tables, num_images = asyncio.run(extract_pdf_llamaparse(pdf_path))

    save_output(data)

    print(f"✅ Saved all data to output/ folder")
    print(f"🖼️ Total images: {num_images}")
    print(f"📊 Total tables: {num_tables}")
