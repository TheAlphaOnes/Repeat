import google.generativeai as genai

key  =  open("key").read()
genai.configure(api_key=key)

generation_config = {
  "temperature": 0.9,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                              generation_config=generation_config,)

def gen(question,notes):
    chat = model.start_chat(history=[])
    a = chat.send_message(notes)
    b = chat.send_message(question)
    print("-"*100)
    print(a.text)
    print("-"*100)
    print(b.text)

    return b.text
