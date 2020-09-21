const express = require('express');
const app = express();

   const path = require('path');
   const dotenv = require('dotenv');
   const methodOverride = require('method-override');
   const session = require('express-session')
   const flash = require('connect-flash')
   const mongoose = require('mongoose');
   const bodyParser = require('body-parser');

  const employeeRoutes = require('./routes/employees');
  const Employee = require('./models/employee');

dotenv.config({path : './config.env'});

// connecting to mongodb database
mongoose.connect(process.env.DATABASE, {
   useNewUrlParser : true,
   useUnifiedTopology: true,
   useCreateIndex : true  
}).then(con =>{
   console.log('data connected')
});

app.use(bodyParser.urlencoded({extended:true}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

//middle ware for method override
app.use(methodOverride('_method'));


//middleware for express session
app.use(session({
   secret:'nodejs',
   resave:true,
   saveUninitialized:true
}))

//middleware for flash
app.use(flash());

//setting messages variable globally
app.use((req,res,next)=>{
   res.locals.success_msg = req.flash(('success_msg'));
   res.locals.error_msg = req.flash(('error_msg'));
   next()
});




// Routers
//get routes starts here
// app.use(employeeRoutes);
app.get('/', (req,res)=>{
   Employee.find({})
      .then(employees => {
         res.render('index', {employees: employees})
      })
      .catch(err =>{
         req.flash('error_msg', 'ERROR: '+ err)
         res.redirect('/')
      })
  
})
app.get('/employee/new', (req,res)=>{
   res.render('new')
})
app.get('/employee/search', (req,res)=>{
   res.render('search', {employee:""})
})
app.get('/employee', (req,res)=>{
   let searchQuery= {name:req.query.name}
   Employee.findOne(searchQuery)

      .then(employee =>{
         res.render('search', {employee: employee})
      })
      .catch(err =>{
         req.flash('error_msg', 'ERROR: '+ err)
          res.redirect('/')
      });
})
app.get('/edit/:id', (req,res) =>{
   let searchQuery = {_id: req.params.id};
   Employee.findOne(searchQuery)
      .then(employee => {
         res.render('edit', {employee:employee})
      })
      .catch(err =>{
         req.flash('error_msg', 'ERROR: '+ err)
         res.redirect('/')
      })
})
//get routes ends here


//post routes starts here
app.post('/employee/new',(req,res)=>{
   let newEmployee = {
      name: req.body.name,
      designation: req.body.designation,
      salary: req.body.salary
   };

   Employee.create(newEmployee)
         .then(employee =>{
            req.flash('success_msg', 'employee data added to database successfully')
            res.redirect('/')
         })
         .catch(err =>{
            req.flash('error_msg', 'ERROR: '+ err)
            res.redirect('/')
         });
});
//post routes ends here

//put routes starts here
app.put('/edit/:id', (req,res) =>{
   let searchQuery = {_id:req.params.id};
   Employee.updateOne(searchQuery, {$set:{
      name: req.body.name,
      designation:req.body.designation,
      salary: req.body.salary
   }})
      .then(employee =>{
         req.flash('success_msg', 'employee data updated successfully')
         res.redirect('/')
      })
      .catch(err =>{
         req.flash('error_msg', 'ERROR: '+ err)
         res.redirect('/')
      })
})

//put routes ends here

//delete routes starts here
   app.delete('/delete/:id', (req,res)=>{
      let searchQuery = {_id:req.params.id};

      Employee.deleteOne(searchQuery)
         .then(employee =>{
            req.flash('success_msg', 'employee deleted successfully')
            res.redirect('/')
         })
         .catch(err =>{
            req.flash('error_msg', 'ERROR: '+ err)
            res.redirect('/')
         })
   });

//delete routes ends here

const port = process.env.PORT || 3000 ;
app.listen(port,() =>{
   console.log('app started')
});