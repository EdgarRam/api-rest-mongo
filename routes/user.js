'use strict'


var express = require( 'express' );
var UserController = require( '../controllers/user');


var api = express.Router();
var mdAuth = require( '../middleware/auth' )

var multipart = require( 'connect-multiparty' )
var mdUpload = multipart({
    uploadDir : './uploads/users'
});


api.get( '/test-controller', mdAuth.ensureAuth, UserController.pruebas )
api.post( '/register', UserController.saveUser )
api.post( '/login', UserController.login )


api.put( '/update-user/:id', mdAuth.ensureAuth, UserController.updateUser )
api.post( '/upload-image-user/:id', [mdAuth.ensureAuth, mdUpload], UserController.uploadImg )


api.get( '/get-image-file/:imageFile', UserController.getImageFile )
api.get( '/keepers/', UserController.getKeeprs )



module.exports = api;
