const express = require('express');
const server = express();

//configurando o servidor para apresentar arquivos estáticos
server.use(express.static('../frontend/public'));
server.use(express.urlencoded({ extended: true }));

//configurando conexão com o postgres
const Pool = require('pg').Pool;
const db = new Pool({
    user: 'doe_user',// nome do usuario dono do banco de dados no postgresql
    password: 'senha', // senha para acesso ao banco de dados
    host: 'localhost', //endereço da maquina que tem o banco de dados
    port: '5432', // porta de acesso ao banco de dados
    database: 'doe' // nome da base de dados
});

//configurando template engine
const nunjucks = require('nunjucks');
nunjucks.configure("../", {
    express: server
})

//configurando as rotas
server.get('/', (req, res) => {
    db.query("SELECT * FROM donors", (err, result) => {
        if(err) return res.send("Erro no banco de dados");

        const donors = result.rows;
        return res.render("./frontend/index.html", { donors });
    });    
});

server.post("/", (req, res) => {
    //pega valor do form
    const name = req.body.name;
    const blood = req.body.blood;
    const email = req.body.email;

    //regra para evitar valores em branco
    if( name == "" || email == "" || blood == "") {
       return res.send("Todos os campos são obrigatorios."); 
    }
    //coloca valor no banco de dados
    const query = `
        INSERT INTO donors (name, email, blood)
        VALUES ($1, $2, $3)`;
    const values = [name, email, blood];

    db.query(query, values, (err) => {
        if(err) return res.send("erro no banco de dados");

        return res.redirect("/");
    });
});

server.listen(3000, () => {
    console.log('Server is running port 3000')
});

