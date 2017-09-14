'use strict'
//modulos
var bcrypt = require( 'bcrypt-nodejs' );
var fs = require( 'fs' );
var path = require( 'path' )

//modelos
var User = require( '../models/user' );

//services
var jwt = require( '../services/jwt')

//acciones
const pruebas = ( req, res) =>{
    res.status(200).send({
        message: 'Probando el controler usuarios y la accion pruebas',
        user: req.user
    })
}

const saveUser = ( req, res ) =>{
    // crear objeto usuario
    var user = new User();

    //get params
    var params = req.body;

    console.log(params);
    if( params.password && params.name && params.surname && params.email ){
        user.name = params.name;
        user.surname = params.surname;
        user.email =  params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        User.findOne( {email: user.email.toLowerCase() }, (err, _user ) =>{
            if( err ){
                res.status(500).send({
                    message : 'Este usuario ya existe'
                })
            }
            else{
                if( !_user){

                    bcrypt.hash( params.password, null, null, ( err, hash) =>{
                        user.password = hash;

                        user.save(( err, userStored )=>{
                            if( err ){
                                res.status(500).send({
                                    message : 'Error al guardar el usuario'
                                })
                            }
                            else{
                                if( !userStored ){
                                    res.status(404).send({
                                        message : 'No se a registrado el usuario'
                                    })
                                }
                                else{
                                    res.status(200).send({
                                        user: userStored,
                                        message: 'Metodo de registro'
                                    })
                                }
                            }
                        })
                    })
                }
                else{
                    res.status(500).send({
                        message : 'Este usuario no puede registrarse porque ya existe'
                    })

                }
            }

        })
            // Cifrarr contraseñña
    }
    else{
        res.status(200).send({
            message: 'Introduce correctamente los datos del usuario'
        })
    }


}

const login = ( req, res )=>{
    var params = req.body;
    var email = params.email
    var password = params.password

    User.findOne( {email: email.toLowerCase() }, ( err, user) => {
        if( err ){
            res.status(500).send({message:'Error al comprobar el usuario'})
        }
        else{

            if( user ){
                bcrypt.compare( password, user.password, ( err, check ) => {
                    if( check ){
                        if( params.getToken){
                            res.status(200).send({
                                toke: jwt.createToken( user )
                            })
                        }
                        else{
                            res.status(200).send({user})
                        }
                    }
                    else{
                        res.status(400).send({message: 'el usuario no ha podigo loguearse correctamente'})
                    }
                })
            }
            else{
                res.status(500).send({message:'El usuario no existe'})

            }

        }
    })
}

const updateUser = ( req, res ) =>{
    var userId = req.params.id;
    var update = req.body;

    if( userId !== req.user.sub ){
        return res.status( 500 ).send({ message: 'No tienes permiso para actualizar el usuario' })
    }

    User.findByIdAndUpdate( userId, update, {new:true}, ( err, userUpdate ) =>{
        if( err ){
            res.status( 500 ).send({ message: 'Error al actualizar el usuario' })
        }
        else{
            if( !userUpdate ){
                res.status( 404 ).send({ message: 'No se ha podido actualizar el usuario' })
            }
            else{
                res.status( 200 ).send({ user: userUpdate });
            }
        }
    })
}

const uploadImg= ( req, res ) =>{
    var userId = req.params.id;
    var fileName = 'no subido....';

    if( req.files ){
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('.');
        var fileExt = extSplit[1];

        if( fileExt ==='png' || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'gif' ){
            if( userId !== req.user.sub ){
                return res.status( 500 ).send({ message: 'No tienes permiso para actualizar el usuario' })
            }

            User.findByIdAndUpdate( userId, {image: fileName }, {new:true}, ( err, userUpdate ) =>{
                if( err ){
                    res.status( 500 ).send({ message: 'Error al actualizar el usuario' })
                }
                else{
                    if( !userUpdate ){
                        res.status( 404 ).send({ message: 'No se ha podido actualizar el usuario' })
                    }
                    else{
                        res.status( 200 ).send({ user: userUpdate, image: fileName });
                    }
                }
            })
        }
        else {
            fs.unlink( filePath, (err) =>{
                if( err){
                    return res.status( 200 ).send({
                        message: 'Extensión no valida y fichero no borrado'
                    })

                }
                res.status( 200 ).send({
                    message: 'Extensión no valida'
                })
            } )
        }

    }
    else{
        res.status(200).send({
            message: 'No se han subido archivos'
        })
    }

}


const getImageFile = ( req, res) =>{
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/users/' + imageFile;


    fs.exists( pathFile, ( _exists )=>{
        if( _exists ){
            res.sendFile(
                path.resolve( pathFile )
            );
        }
        else{
            res.status(404).send({
                message: 'la imagen no existe'
            })
        }
    });
}

const getKeeprs = ( req, res ) =>{
    User.find({role:'ROLE_ADMIN'})
        .exec( ( err, users) =>{
            if( err ){
                return res.status( 500 ).send({
                    message: 'Error en la petición'
                } )
            }
            else {
                if( !users){
                    return res.status( 500 ).send({
                        message: 'No hay cuidadores'
                    } )
                }
                else {
                    res.status( 200 ).send({
                        users
                    })
                }
            }

        } )
}


module.exports ={
    pruebas,
    saveUser,
    login,
    updateUser,
    uploadImg,
    getImageFile,
    getKeeprs
};
