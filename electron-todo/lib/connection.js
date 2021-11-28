const mysql=require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "26122018",
    database:"todolist"
})

connection.connect();


module.exports={
    db:connection//burada dışarıya aktarmak için export ediyoruz
}
