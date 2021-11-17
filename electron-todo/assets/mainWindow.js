const electron=require("electron");
const {ipcRenderer} = electron; //frontend tarafda ipcRenderer; backend-->ipcMain

checkTodoCount();

const todoValue=document.querySelector("#todoValue");

//yazınca enter yapmamız için bir kod
todoValue.addEventListener("keypress",(e)=>{
    console.log(e)// keyCode her zaman 13 veriyor
    if(e.keyCode==13){
        ipcRenderer.send("newTodo:save",{ ref: "main", todoValue:e.target.value });
        e.target.value="";
    }
})

document.querySelector("#addBtn").addEventListener("click",()=>{

    //main.js'de de todoValue olduğu için program çalışsa da hata veriyor o yüzden
    //biz bu todoValue'ya referans vererek hatanın önüne geçmiş oluyor
    // ipcRenderer.send("newTodo:save", todoValue.value);//veri ekleme
    ipcRenderer.send(
        "newTodo:save",
        {//main.js den geldiğini söylüyoruz
            ref: "main", todoValue:todoValue.value
        });//veri ekleme

    todoValue.value="";//ekledikten sonra input'u temizleme
})

document.querySelector("#closeBtn").addEventListener("click",()=>{
    if (confirm("Uygulamadan çıkmak istiyor musunuz?")){
        ipcRenderer.send("todo:close");
    }
})

ipcRenderer.on("todo:addItem",(err, todo)=>{
    console.log(todo);

    //container..
    const container= document.querySelector(".todo-container")


    //row
    const row=document.createElement("div");//div den üret demek
    row.className="row"


    //col
    const col= document.createElement("div")
    col.className="todo-item p-2 mb-3  text-light bg-dark col-md-8 offset-2 shadow card d-flex justify-content-center flex-row align-items-center";
    // col.style.backgroundColor="#582E48!important" ---> bu çalışmadı o yüzden className'e todo-item ekleyip onu da style.css'e ekledik


    //p
    const p=document.createElement("div")
    p.className="m-0 w-100"; //margin-0 width-100
    // p.innerText="Bu bir yapılacaklar listesidir..."
    p.innerText=todo.text


    //sil btn
    const deleteBtn=document.createElement("button")//button olacağını söylüyoruz
    deleteBtn.className="btn btn-sm btn-outline-danger flex-shrink-1"
    deleteBtn.innerText="X" // innerText - içeriği demek


    //deleteBtn tıklandığında
    deleteBtn.addEventListener("click",(e)=>{
        if(confirm("Bu kaydı silmek istediğinizden emin misiniz?")){
            //tıklanan elementin kendisinin hemen üstündeki elementin bi üstündeki elemente git diyoruz
            e.target.parentNode.parentNode.remove();
            checkTodoCount();
        }
    })


    //html tarafına bakarsak içden dışa doğru bir birinin içine ekleyerek gideceğiz
    //yani: col->row->container
    col.appendChild(p);

    col.appendChild(deleteBtn);

    row.appendChild(col);
    container.appendChild(row);

    checkTodoCount();
})

function checkTodoCount() {
    const container=document.querySelector(".todo-container")
    const alertContainer=document.querySelector(".alert-container")
    document.querySelector(".total-count-container").innerText=container.children.length;
    if (container.children.length!==0){
        alertContainer.style.display="none"; //kayıt varsa uyarı çıkmaz
    }else{
        alertContainer.style.display="block";
    }
}


