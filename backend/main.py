from flask import Flask , request,send_file,jsonify
from AI import gen
from tinydb import TinyDB,Query
import uuid
import os


app = Flask(__name__)



notes = TinyDB("db/notes.json")
usr = TinyDB("db/user.json")
ext = TinyDB("db/notes_extention.json")
Notes = Query()
Userg = Query()


@app.get("/")
def index():
    return "this is repeats backend api server"

@app.get("/api/list-notes")
def list_notes():
    return notes.all()


@app.post("/api/upload-notes")
def notes_upload():

    file = request.form.get("md")
    title  = request.args.get('title')
    noflash = request.args.get("noflash")
    noqna = request.args.get("noqna")

    x = ".md"
    id = uuid.uuid4().hex
    host = request.host_url
    name = id+x
    open(f"mysite/storage/{name}","w").write(file)  
    # file.save(f"storage/{name}")
    
    pattern = {
        "title":str(title),
        "id":id,
        "noFlash":noflash,
        "noQ":noqna,
        "file":str(name),
        "embeedURL":str(f"{host}api/embeed-notes?id={name}")

    }
    

    notes.insert(pattern)    
    
    return jsonify(pattern)

@app.get("/api/embeed-notes")
def download_notes():
    id = request.args.get("id")
    pathFile = "storage/"+id
    return send_file(pathFile)


@app.post("/api/upload-ext")
def upload_ext():
    title = request.args.get('title')
    id = request.args.get('id')
    newext = request.json
    pattern_ext = {
        "title":title,
        "id":id,
        "flash":newext.get("flash"),
        "qna":newext.get("qna")
    }
    
    ext.insert(pattern_ext)

    return jsonify(pattern_ext)

@app.get("/api/embeed-ext")
def notes_ext():
    Id =  request.args.get("id")
    type = request.args.get("type")
    
    my_ext = ext.search(Notes.id == Id)
    print(my_ext)
    if type == "qna":
        pattern_ext = {
            "title":my_ext[0]['title'],
            "id":Id,
            "qna":my_ext[0]['qna']
        }
        return pattern_ext
    
    elif type == "flash":
        pattern_ext = {
            "title":my_ext[0]['title'],
            "id":Id,
            "flash":my_ext[0]['flash']
        }
        return pattern_ext
    
    elif type == "all":
        pattern_ext = {
            "title":my_ext[0]['title'],
            "id":Id,
            "qna":my_ext[0]['qna'],
            "flash":my_ext[0]['flash']
        }
        return pattern_ext
    
    return {"data":"give me something"}

@app.get("/api/ext-list")
def ext_list():
    return jsonify(ext.all())

@app.get("/api/user-data")
def user_data():
    a = usr.search(Userg.userid == "xyz")
    return a

@app.get("/api/user-data-update")
def user_data_update():
    type = request.args.get("type")
    
    if type =="month":
        mID = str(request.args.get("monthID"))
        mV = int(request.args.get("monthValue"))
        print(mID,mV)
        a = usr.search(Userg.userid == "xyz")
        a[0]['month'][mID] = mV
        usr.update({"month":a[0]['month']},Userg.userid == "xyz")
        return "month updated"
    
    elif type == "year":
        mID = str(request.args.get("yearID"))
        mV = int(request.args.get("yearValue"))
        print(mID,mV)
        a = usr.search(Userg.userid == "xyz")
        a[0]['year'][mID] = mV
        usr.update({"year":a[0]['year']},Userg.userid == "xyz")
        return "year updated"
    
    elif type == "score":
        wV = request.args.get("scoreValue")
        usr.update({"score":wV},Userg.userid == "xyz")
        return "score updated"
    
    elif type == "week":
        wV = request.args.get("weekValue")
        usr.update({"week":wV},Userg.userid == "xyz")
        return "week updated"

    

    return "not updated"
 

@app.post("/api/ai")
def ai():
    n = request.form.get("notes")
    q = request.form.get("question")
    rsp = gen(q,n)
    return jsonify({"q":q,"rsp":rsp,"context":n})
    

if __name__ == "__main__":
    
    app.run(debug=True)



    # pattern = {
    #     "name":"",
    #     "userid":"",
    #     "year":{"1":100,"2":100,"3":50,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0},
    #     "month":{"1":100,"2":100,"3":50,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},
    #     "score":1000,
    #     "week":16
    # }