'use strict'

// modules
var fs = require( 'fs' );
var path = require( 'path' )


// models
var User = require( '../models/user' );
var Animal = require( '../models/animal' );


//acciones
const pruebas = ( req, res) =>{
    res.status(200).send({
        message: 'Probando el controler usuarios y la accion pruebas',
        user: req.user
    })
}


const saveAnimal = ( req, res) =>{
    var animal = new Animal();

    var params = req.body;


    if( params.name ){
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;

        animal.save( ( err, animalStored ) =>{
            if( err ){
                return res.status( 500 ).send( { message: 'Error en el servidor' } )
            }

            if( !animalStored ){
                res.status( 404 ).send( { message: 'No se ha guardado el animal' } )
            }
            else{
                res.status( 200 ).send( { animal: animalStored } )
            }

        } )
    }
    else{

        res.status(200).send({
            message: 'El animal debe contener un nombre',
        })
    }


}

const getAnimals = ( req, res ) => {
    Animal.find({}).populate({path:'user'}).exec( ( err, animals ) => {
        if( err ){
            return res.status( 500 ).send( { message: 'Error en la petición' })
        }

        if( !animals ){
            return res.status( 404 ).send( { message: 'No hay animales' })
        }
        else{
            return res.status( 200 ).send( {
                animals
            })
        }
    });
}


const getAnimal = ( req, res ) =>{
    var animalId = req.params.id;

    Animal.findById( animalId ).populate({ path:'user' })
    .exec( ( err, animal ) =>{
        if( err ){
            return res.status( 500 ).send( { message: 'Error en la petición' })
        }

        if( !animal ){
            return res.status( 404 ).send( { message: 'El animal no exite' })
        }
        else{
            return res.status( 200 ).send( {
                animal
            })
        }
    })
}

const updateAnimal = ( req, res ) =>{
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate( animalId, update, { new:true}, ( err, animalUpdate ) =>{

        if( err ){
            return res.status( 500 ).send( { message: 'Error en la petición' })
        }

        if( !animalUpdate ){
            return res.status( 404 ).send( { message: 'No se ha actualizado el animal' })
        }
        else{
            res.status( 200 ).send( { animal: animalUpdate })
        }
    });
}

const uploadImg= ( req, res ) =>{
    console.log(req);
    var animalId = req.params.id;
    var fileName = 'no subido....';

    if( req.files ){
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('.');
        var fileExt = extSplit[1];

        if( fileExt ==='png' || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'gif' ){

            Animal.findByIdAndUpdate( animalId, {image: fileName }, {new:true}, ( err, animalUpdate ) =>{
                if( err ){
                    return res.status( 500 ).send({ message: 'Error al actualizar el animal' })
                }

                if( !animalUpdate ){
                    res.status( 404 ).send({ message: 'No se ha podido actualizar el animal' })
                }
                else{
                    res.status( 200 ).send({ user: animalUpdate, image: fileName });
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
    var pathFile = './uploads/animals/' + imageFile;

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


const deleteAnimal = ( req, res ) =>{
    var animalId = req.params.id;

    Animal.findByIdAndRemove( animalId, ( err, animalRemove ) => {

        if( err ){
            return res.status( 500 ).send({ message : 'Error en la petición' });
        }

        if( !animalRemove ){
            return res.status( 404 ).send({ message : 'No se ha borrado el aimal' });
        }
        else {
            return res.status( 200 ).send({ animal: animalRemove });
        }
    })
}


module.exports = {
    pruebas,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImg,
    getImageFile,
    deleteAnimal
}
