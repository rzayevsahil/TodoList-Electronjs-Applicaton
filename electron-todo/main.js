const electron=require("electron");
const url=require("url");
const path=require("path");

const db= require("./lib/connection").db //connection.js de export etdiğimiz değer ismi db diye .db yazdık



const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow, addWindow;
//let todoList = [];//db kullanıyoruz diye artık todolist yazıb simüle etmeye gerek kalmadı

app.on("ready",()=>{

    mainWindow = new BrowserWindow({
        //frame:false // kenar çerçeviyi göstermiyor
    });

    //bunu yaptığımız zaman pencerenin boyutunu büyültüp küçültemiyoruz
    mainWindow.setResizable(false)

    //Pencerenin oluşturulması
    mainWindow.loadURL(
        url.format({
            pathname:path.join(__dirname,"pages/mainWindow.html"),
            protocol:"file:",
            slashes:true
        })
    )

    //Menunun oluşturulması
    const mainMenu=Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on("close", ()=>{
        app.quit();
    })


    //newTodo penceresi eventleri...
    ipcMain.on("newTodo:close",()=>{
        //console.log("selam")
        addWindow.close();
        addWindow = null;
    })

    ipcMain.on("todo:close",()=>{
        app.quit();
        addWindow=null;

    })

    ipcMain.on("newTodo:save",(err,data)=>{
        //console.log(data)
        if (data){
            // let todo={
            //     id:todoList.length+1,
            //     text:data.todoValue
            // }
            //todoList.push(todo);

            db.query("INSERT INTO todos SET name = ?", data.todoValue, (error, results, fields)=>{
                //console.log(results);//buradan inserted id'ye bakabiliriz
                if (results.insertId > 0){
                    mainWindow.webContents.send("todo:addItem", {
                        id:results.insertId,
                        name: data.todoValue //db de name olarak kaydedilmiş
                    });
                }
            })

            //değeri listeye ekliyoruz
            // todoList.push({
            //     id:todoList.length+1,
            //     text:data
            // })

            //console.log(todoList);

            //backend'den frontend'e bilgi gönderme
            //aslında dolaylı yoldan frontend'den backend sayesinde diğer frontend'e bilgiyi gönderiyoruz
            //mainWindow.webContents.send("todo:addItem", todoList);

            //mainWindow.webContents.send("todo:addItem", todo);

            if (data.ref=="new"){//data içindeki referans new dan geliyorsa
                //data ekledikden sonra ekleme sayfasından çıkış yapıyoruz
                addWindow.close();
                addWindow=null;
            }

        }
    })



    //diğer tarafda dom yüklendi mi yüklenmedi mi bilmiyoruz
    //yani yüklenmemiş bir doma veri gönderib birşeyler oluşturmak istersek elimizde patlar
    //işte bunun olmaması için işimizi sağlama alıyoruz ve aşağıdaki kod bu işe yarıyor
    //mainWindow içindeki webContents bir kereye (once) mahsus olmak üzere bunu çalıştır
    //webContentimin bulunduğu dom yüklenmişse bu fonksiyonu çalıştır
    mainWindow.webContents.once("dom-ready", ()=>{
        db.query("SELECT * FROM todos", (error, results, fields)=>{
            //console.log(results);
            //uygulama açıldığında kayıtların orda listelenmesini sağlayacak
            mainWindow.webContents.send("initApp", results); //initApp - initialize(başlatmak) app
        })
    })


    ipcMain.on("remove:todo", (e, id)=>{
        console.log("silinmek istenen id "+id);
        //id=? bunun anlamı buraya bir değer gelicek ve bunu ikinci argümandan al yani id'den
        db.query("DELETE FROM  todos WHERE id = ?", id, (e, results, fields)=>{
            //console.log(results);//buradan affectedRows'u seçiyoruz
            if (results.affectedRows > 0){
                console.log("silme işlemi başarılıdır...")
            }
        })
    })
});


//Menu Template yapısı
const mainMenuTemplate = [
    {
        label: "Dosya",
        submenu: [
            {
                label: "Yeni TODO Ekle",
                click(){
                    createWindow();
                }
            },
            { label: "Tümünü sil" },
            {
                label: "Çıkış",
                accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                role: "quit",
            },
        ],
    },

];

if (process.platform == "win32") {
    mainMenuTemplate.unshift({
        label: "ElectronJs-Todo",  //app.getName(),
        role: "TODO",
    });
}

if (process.env.NODE_ENV !== "production"){
    mainMenuTemplate.push(
        {
            label: "Geliştirici araçları",
            submenu: [
                {
                    label: "Geliştirici araçları",
                    click(item, focusedWindow) {
                        focusedWindow.toggleDevTools(); //bu sayfada mı yoksa ana sayfada mı geliştici dev tool'su açıcam onu gösterir
                    },
                },
                {
                    label: "Yenile",
                    role: "reload"
                }
            ]
        }
    )
}

function createWindow() {
    addWindow=new BrowserWindow({
        width:480,
        height:175,
        title: "Yeni bir pencere",
        frame:false
    });

    addWindow.setResizable(false);

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname,"pages/newTodo.html"),
        protocol: "file:",
        slashes: true
    }))

    addWindow.on("close",()=>{
        addWindow = null;
    })
}


function getTodoList() {
    console.log(todoList)
    //return todoList;
}
