const electron = require("electron"); //electron'u reqire(yani import) ediyoruz
//kullanacağımız html sayfaları için araçlar
const url = require("url");
const path = require("path");

//main.html de ipcRender'e karşılık burda ipcMain kullanılıyor
const { app, BrowserWindow, Menu, ipcMain } = electron; //electronun içindeki özellikleri al ve bana birer sabit olarak ver demek

let mainWindow; //ana sayfamız olucak

//uygulamamız hazır olduğu zaman bu fonksiyonu çalıştır diyoruz
app.on("ready", () => {
  //alert(); burası bir backend o yüzden bu js kodu undefined
  console.log("Uygulamamız çalışıyor...");

  //pencere oluşturmak
  mainWindow = new BrowserWindow({ 
    //burada özellik belirte biliyoruz mesela pencere boyutu
    width: 640, height: 360
  });

  // console.log(process.platform);

  //bir url'den bu safyanın ana pencerenin yapısını al
  // file://electron/main.html
  mainWindow.loadURL(
    url.format({
      //projenin bulunduğu bu dosyanın çalıştığı yerin fiziksel olarak yolu + main.html dosyası
      pathname: path.join(__dirname, "main.html"),
      //bu arkadaş nasıl nerden geliyor ve bu bir dosya olduğu için file yazıyoruz
      protocol: "file:",
      // file://electron/main.html buradaki slash ayrımı için
      slashes: true
    })
  );

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //bu menuyu benim genel uygulamamın menusu olarak işaret ediyorum
  Menu.setApplicationMenu(mainMenu);

  ipcMain.on("key", (err,data)=>{
    console.log(data);
  })

  ipcMain.on("key:inputValue",(err,data)=>{
    console.log(data);
  })

  //Yeni pencere
  ipcMain.on("key:newWindow",()=>{
    //console.log("okey");
    createWindow();
  })

  //yeni açılan pencere ana pencere kapansa bile kapanmıyor ve uygulama çalışıyor
  //bu yüzden burda ana pence kapanıyorsa uygulamadan çıkış verilsin diyoruz
  mainWindow.on("close",()=>{
    app.quit();
  })

});

//bizim template bir array olucak, her bir menu elemanı da bir obje ile belirtilicek
const mainMenuTemplate = [
  {
    label: "Dosya", //bu bir menu
    submenu: [
      // bu da menunun alt menüleri
      { label: "Yeni TODO Ekle" },
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
    label: app.getName(), 
    role: "TODO",
  });
}

if (process.env.NODE_ENV !== "production"){
  mainMenuTemplate.push(
      {
        label: "Dev Tools",
        submenu: [
          {
            label: "Geliştirici Penceresini Aç",
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


//pencere oluşturmak
function createWindow() {
  addWindow=new BrowserWindow({
    width: 482,
    height: 200,
    title: "Yeni Bir Pencere"
  });

  addWindow.loadURL(
      url.format({
        pathname: path.join(__dirname,"modal.html"),
        protocol: "file:",
        slashes: true
      })
  )

  //eğer açılan pencere kapanırsa o durumda  yapacağımız işlem addWindow'u null yapmak olsun ki
  //bellekte fazla bir yer kaplamasın
  addWindow.on("close",()=>{
    addWindow = null;
  })

}
