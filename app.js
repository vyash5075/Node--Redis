const express=require('express');
const exphbs=require('express-handlebars');
const path=require('body-parser');
const bodyParser = require('body-parser')
const redis=require('redis');
const methodOverride=require('method-override');



//create redis client
let client=redis.createClient();

client.on('connect',function(){
    console.log('Connected to redis');
});


//set Port
const port =3000;

//Init app
const app=express();



// view engine
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');


//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));



//method Override
app.use(methodOverride('_method'));     //delete request with the form


//root route
app.get('/',function(req,res,next){
    res.render('searchusers')
})


//search procesing
app.post('/user/search',function(req,res,next){
    let id=req.body.id;
    client.hgetall(id,function(err,obj){
        if(!obj){
            res.render('searchusers',{
                error:'User does not exist'
            });
        }
        else{
            obj.id=id;
            res.render('details',{
                user:obj
            })
        }
    })

});


//add user

app.get('/user/add',function(req,res,next){
    res.render('adduser')
})

app.post('/user/add',function(req,res,next){
    let id=req.body.id;
    let first_name=req.body.first_name
    let last_name=req.body.last_name
    let email=req.body.email;
    let phone=req.body.phone;

    client.hmset(id,[
        'first_name',first_name,
        'last_name',last_name,
        'email',email,
        'phone',phone
    ],function(err,reply){
        if(err){
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    })
})


//delete route
app.delete('/user/delete/:id',function(req,res,next){
        client.del(req.params.id);
        res.redirect('/')
})  

//port listening
app.listen(port,function(){
    console.log('server started on port'+port);
})