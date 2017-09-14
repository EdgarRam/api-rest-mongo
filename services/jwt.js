'use strict'

var jwt = require( 'jwt-simple' );
var moment = require( 'moment' );
var secret = 'Sect34'

exports.createToken = ( _user ) =>{
    var payload ={
        sub: _user._id,
        name: _user.name,
        surname: _user.surname,
        email: _user.email,
        role: _user.role,
        image: _user.image,
        iat: moment().unix(),
        exp: moment().add( 30, 'days' ).unix
    }

    return jwt.encode( payload, secret )
}
